/* 章节清单 —— 引擎按此顺序播放。由 root 维护，其他 agent 不要修改。 */
(function () {
  window.STORY = window.STORY || {};
  window.STORY.__manifest = [
    { id: 'ch01', num: 1,  title: '于都河畔',       date: '1934年10月',      place: '江西·于都',     file: 'src/story/ch01.js' },
    { id: 'ch02', num: 2,  title: '突破封锁线',     date: '1934年10-11月',   place: '赣南·湘南',     file: 'src/story/ch02.js' },
    { id: 'ch03', num: 3,  title: '湘江血战',       date: '1934年11-12月',   place: '广西·湘江',     file: 'src/story/ch03.js' },
    { id: 'ch04', num: 4,  title: '通道转兵',       date: '1934年12月',      place: '湖南·通道',     file: 'src/story/ch04.js' },
    { id: 'ch05', num: 5,  title: '黎平会议',       date: '1934年12月',      place: '贵州·黎平',     file: 'src/story/ch05.js' },
    { id: 'ch06', num: 6,  title: '猴场跨年',       date: '1934年12月-1935年1月', place: '贵州·猴场', file: 'src/story/ch06.js' },
    { id: 'ch07', num: 7,  title: '遵义会议',       date: '1935年1月',       place: '贵州·遵义',     file: 'src/story/ch07.js' },
    { id: 'ch08', num: 8,  title: '一渡赤水',       date: '1935年1月',       place: '贵州·土城',     file: 'src/story/ch08.js' },
    { id: 'ch09', num: 9,  title: '扎西整编·二渡赤水', date: '1935年2月',    place: '云南·扎西',     file: 'src/story/ch09.js' },
    { id: 'ch10', num: 10, title: '娄山关大捷',     date: '1935年2月',       place: '贵州·娄山关',   file: 'src/story/ch10.js' },
    { id: 'ch11', num: 11, title: '三渡·四渡赤水',   date: '1935年3月',       place: '川黔边·赤水河', file: 'src/story/ch11.js' },
    { id: 'ch12', num: 12, title: '巧渡金沙江',     date: '1935年5月',       place: '云南·皎平渡',   file: 'src/story/ch12.js' },
    { id: 'ch13', num: 13, title: '彝海结盟',       date: '1935年5月',       place: '四川·冕宁',     file: 'src/story/ch13.js' },
    { id: 'ch14', num: 14, title: '强渡大渡河',     date: '1935年5月',       place: '四川·安顺场',   file: 'src/story/ch14.js' },
    { id: 'ch15', num: 15, title: '飞夺泸定桥',     date: '1935年5月',       place: '四川·泸定',     file: 'src/story/ch15.js' },
    { id: 'ch16', num: 16, title: '翻越夹金山',     date: '1935年6月',       place: '四川·宝兴',     file: 'src/story/ch16.js' },
    { id: 'ch17', num: 17, title: '懋功会师与草地', date: '1935年6-8月',     place: '川西北',        file: 'src/story/ch17.js' },
    { id: 'ch18', num: 18, title: '激战腊子口',     date: '1935年9月',       place: '甘肃·腊子口',   file: 'src/story/ch18.js' },
    { id: 'ch19', num: 19, title: '吴起镇·落脚陕北', date: '1935年10月',     place: '陕西·吴起镇',   file: 'src/story/ch19.js' },
    { id: 'ch20', num: 20, title: '会宁大会师',     date: '1936年10月',      place: '甘肃·会宁',     file: 'src/story/ch20.js' }
  ];
  window.STORY.__byId = {};
  window.STORY.__manifest.forEach(function (c) { window.STORY.__byId[c.id] = c; });
})();
