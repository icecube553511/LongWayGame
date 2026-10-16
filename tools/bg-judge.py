#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""用 Gugu-gpt-QQ 分组的视觉模型给「场景背景」位图做看图验收。

    python tools/bg-judge.py --all
    python tools/bg-judge.py --only bg_luding,bg_huining
    python tools/bg-judge.py --all --model gpt-6-astra --concurrency 3

为什么要这一道：出图端（NekoGptImage 的 gpt-image-2.5-sunburst）只会「画得像」，
不会自己交代「画里有没有那十三根铁索、有没有出现文字、群像里的人是不是同一个人」。
本工具把 src/data/bgart.js 的 must / crowd 清单交给另一个分组
（Gugu-gpt-QQ：/v1/models 实测 gpt-5.6-sol / gpt-5.6-terra / gpt-6-astra / gpt-6-sol / gpt-6.1-sol，
支持 chat/completions 的 image_url 输入）逐张核对，把结论落成 tmp/bg/review/<id>.md
与 tmp/bg/review/summary.json —— **它是给人复核的初判，不是自动放行**：
判定 FAIL 的条目由人（或 root）看图后决定重出还是改提示词。

判定项：
  style   —— 低多边形块面、无连续渐变/照片感/虚化/光斑；画面里不能有文字
  must[]  —— 逐条 must 问「在不在」
  crowd   —— 有几处人群、能不能数出不同的人（同一张脸/同一件衣服重复 = FAIL）

PIL 用来把 1920×1080 压到 1024 宽再送审（原图 base64 太大，判定用不着那个分辨率）。
"""
import argparse
import base64
import io
import json
import os
import re
import sqlite3
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG_DIR = os.path.join(ROOT, 'assets', 'generated', 'bg')
RAW_DIR = os.path.join(ROOT, 'tmp', 'bg-raw')
REVIEW_DIR = os.path.join(ROOT, 'tmp', 'bg', 'review')
PROMPTS = os.path.join(ROOT, 'tmp', 'bg', 'prompts.json')
DB = 'C:/Users/12254/.cc-switch/cc-switch.db'
PROVIDER = 'Gugu-gpt-QQ'
DEFAULT_MODEL = 'gpt-6.1-sol'
# 备用视觉模型：上游 502「模型服务暂时不可用」是间歇性的，一个模型打不动就换同组另一个。
FALLBACK = ['gpt-6.1-sol', 'gpt-6-astra', 'gpt-6-sol']
JUDGE_W = 1024


def load_provider():
    """从 cc-switch 数据库读 Gugu-gpt-QQ 的 key 与 base_url（不落盘、不打印）。"""
    con = sqlite3.connect('file:' + DB + '?mode=ro', uri=True)
    row = con.execute('select settings_config from providers where name = ?', (PROVIDER,)).fetchone()
    con.close()
    if not row:
        raise SystemExit('cc-switch 里找不到 provider：' + PROVIDER)
    cfg = json.loads(row[0] or '{}')
    key = (cfg.get('auth') or {}).get('OPENAI_API_KEY')
    if not key:
        raise SystemExit(PROVIDER + ' 没有可用的 key')
    m = re.search(r'base_url\s*=\s*"([^"]+)"', cfg.get('config') or '')
    base = (m.group(1) if m else 'https://api.999555999.com').rstrip('/')
    return key, base


def load_prompts():
    if not os.path.exists(PROMPTS):
        raise SystemExit('缺少 %s —— 先跑：node tools/bg-art.js --json > tmp/bg/prompts.json' % PROMPTS)
    with open(PROMPTS, encoding='utf-8') as f:
        return {p['id']: p for p in json.load(f)}


def data_uri(path):
    im = Image.open(path).convert('RGB')
    if im.width > JUDGE_W:
        im = im.resize((JUDGE_W, max(1, round(im.height * JUDGE_W / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=82)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii'), im.size


def build_question(p):
    must = '\n'.join('%d. %s' % (i + 1, m) for i, m in enumerate(p.get('must') or []))
    crowd = p.get('crowd') or ''
    q = [
        '你是这张游戏背景插画的美术验收员。这是一款立体几何（low-poly / 硬边刻面）风格的历史游戏，',
        '背景是舞台，玩家的立绘与对话框会压在这张图上。请只看图，逐项回答，不要客套。',
        '',
        '这张图应当表现：' + (p.get('scene_cn') or ''),
    ]
    if must:
        q += ['', '必须出现的元素：', must]
    if crowd:
        q += ['', '画面里应当有人群：' + crowd,
              '重点核对：这些人是不是**看得出是不同的人**（身高体态、年龄、脸型、神态、军装磨损程度都不同），'
              '还是同一张脸/同一件衣服复制粘贴成几排？']
    q += [
        '',
        '另外核对画风：画面必须由可见的多边形块面构成、面与面之间有明度差；',
        '不能有摄影式连续渐变、景深虚化、镜头光斑、发光溢光，不能是油画或动画平涂风；',
        '画面里不能出现任何文字、字母、印章或水印。',
        '',
        '只输出一个 JSON 对象，不要代码块、不要多余解释，字段如下：',
        '{',
        '  "style_ok": true/false,            // 是否低多边形刻面风格且无照片感',
        '  "style_note": "一句话说明",',
        '  "text_in_image": true/false,      // 画面里是否出现了文字/字母/水印',
        '  "elements": [ {"item": "元素原文", "present": true/false, "note": "一句话"} ],',
        '  "crowd": {"people": 数字或null, "distinct": true/false/null, "note": "一句话"},',
        '  "story_ok": true/false,           // 画面内容是否与上面的场景描述一致',
        '  "verdict": "PASS"/"FAIL",',
        '  "reason": "一句话结论"',
        '}'
    ]
    return '\n'.join(q)


def ask(key, base, model, question, uri, timeout=180):
    body = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': [
            {'type': 'text', 'text': question},
            {'type': 'image_url', 'image_url': {'url': uri}}
        ]}],
        'max_tokens': 1600
    }).encode('utf-8')
    req = urllib.request.Request(base + '/v1/chat/completions', data=body, method='POST',
                                 headers={'authorization': 'Bearer ' + key,
                                          'content-type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            j = json.loads(r.read().decode('utf-8', 'replace'))
    except urllib.error.HTTPError as e:
        # 把上游的报错正文带出来 —— 只报 "HTTP 502" 的话，分不清是网关抖动、
        # 图像太大还是这一组的视觉通道没开。
        body = ''
        try:
            body = e.read().decode('utf-8', 'replace')[:400]
        except Exception:
            pass
        raise RuntimeError('HTTP %s %s' % (e.code, body.replace('\n', ' ')))
    return (j.get('choices') or [{}])[0].get('message', {}).get('content', '') or ''


def parse_json(text):
    """模型有时会把 JSON 包在代码块或解释里：抓第一个平衡的 {…} 再解析。"""
    t = text.strip()
    t = re.sub(r'^```(?:json)?|```$', '', t, flags=re.M).strip()
    start = t.find('{')
    if start < 0:
        return None
    depth = 0
    for i, ch in enumerate(t[start:], start):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(t[start:i + 1])
                except Exception:
                    return None
    return None


def judge_one(pid, p, key, base, model, force):
    """返回 (pid, verdict, payload)。已有的结果不重复请求（--force 可覆盖）。"""
    out_md = os.path.join(REVIEW_DIR, pid + '.md')
    img = os.path.join(BG_DIR, pid + '.png')
    if not os.path.exists(img):
        return pid, 'NOIMAGE', {'reason': '没有位图 ' + img}
    if os.path.exists(out_md) and not force:
        old = open(out_md, encoding='utf-8').read()
        m = re.search(r'verdict:\s*(PASS|FAIL)', old)
        return pid, (m.group(1) if m else 'CACHED'), {'reason': '沿用已有结论（--force 可重问）'}
    uri, size = data_uri(img)
    q = build_question(p)
    last = ''
    models = [model] + [m for m in FALLBACK if m != model]
    for mi, m in enumerate(models):
        for attempt in range(2):
            try:
                last = ask(key, base, m, q, uri)
                break
            except Exception as e:
                last = ''
                err = str(e)[:200]
                if mi == len(models) - 1 and attempt == 1:
                    return pid, 'ERROR', {'reason': '请求失败：' + err}
                # 上游 502「模型服务暂时不可用」实测是间歇性的：退避后重试，再不行换同组另一个视觉模型。
                time.sleep(5 * (attempt + 1) + 4 * mi)
        if last:
            model = m
            break
    data = parse_json(last)
    if not data:
        return pid, 'UNPARSED', {'reason': '模型没有给出可解析的 JSON', 'raw': last[:600]}
    verdict = str(data.get('verdict', '?')).upper()
    with open(out_md, 'w', encoding='utf-8') as f:
        f.write('# %s —— %s\n\n' % (pid, p.get('name') or ''))
        f.write('- 送审图：`assets/generated/bg/%s.png`（送审前压到 %d 宽）\n' % (pid, size[0]))
        f.write('- 判定模型：%s（Gugu-gpt-QQ 分组）\n' % model)
        f.write('- verdict: %s\n\n' % verdict)
        f.write('```json\n%s\n```\n\n' % json.dumps(data, ensure_ascii=False, indent=1))
        f.write('## 场景（本工程写的口径）\n\n%s\n' % (p.get('scene_cn') or ''))
        if p.get('must'):
            f.write('\n## 必须出现\n\n' + '\n'.join('- ' + m for m in p['must']) + '\n')
        if p.get('crowd'):
            f.write('\n## 人群\n\n%s\n' % p['crowd'])
        f.write('\n## 模型原始回答\n\n```\n%s\n```\n' % last.strip()[:4000])
    return pid, verdict, data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='', help='逗号分隔的 id；缺省配合 --all')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--model', default=DEFAULT_MODEL, choices=['gpt-6.1-sol', 'gpt-6-astra', 'gpt-6-sol', 'gpt-5.6-sol', 'gpt-5.6-terra'])
    ap.add_argument('--concurrency', type=int, default=3)
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()

    prompts = load_prompts()
    ids = [s.strip() for s in args.only.split(',') if s.strip()]
    if args.all or not ids:
        ids = [p['id'] for p in prompts.values() if not p.get('svgOnly')]
    ids = [i for i in ids if i in prompts]
    if not ids:
        raise SystemExit('没有要验收的条目')

    key, base = load_provider()
    os.makedirs(REVIEW_DIR, exist_ok=True)
    print('模型 %s  待验收 %d 张  并发 %d' % (args.model, len(ids), args.concurrency))
    results = {}
    with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as ex:
        futs = [ex.submit(judge_one, pid, prompts[pid], key, base, args.model, args.force) for pid in ids]
        for f in futs:
            pid, verdict, data = f.result()
            results[pid] = verdict
            print('  %-22s %s   %s' % (pid, verdict, str(data.get('reason', ''))[:90]))

    summary = {
        'model': args.model, 'provider': PROVIDER,
        'total': len(results),
        'pass': sorted([k for k, v in results.items() if v == 'PASS']),
        'fail': sorted([k for k, v in results.items() if v in ('FAIL', 'UNPARSED', 'ERROR', 'NOIMAGE')]),
        'verdicts': results
    }
    with open(os.path.join(REVIEW_DIR, 'summary.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=1)
    print('\nPASS %d / %d   FAIL %d（详见 tmp/bg/review/）'
          % (len(summary['pass']), len(results), len(summary['fail'])))
    if summary['fail']:
        print('  ' + ', '.join(summary['fail']))
        sys.exit(1)


if __name__ == '__main__':
    main()
