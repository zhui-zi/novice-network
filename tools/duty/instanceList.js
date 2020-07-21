const fs = require('fs')
const csv = fs.readFileSync('ContentFinderCondition.csv').toString()

const lines = csv.replace(/\r\n/g, '\n').split('\n')
let data = []

const partySizeList = [null, null, 4, 8, 24]

const types = [
  null,
  null,
  '迷宫挑战',
  null, // 行会令
  '讨伐歼灭战',
  '大型任务'
]

types[28] = '绝境战'

for (const line of lines) {
  const cols = line.split(',')
  const index = cols.shift()
  const instanceType = cols[2]
  const partyTypeId = cols[9]
  const level = cols[15]
  const maxLevel = cols[16]
  const ilvMin = cols[17]
  const ilvMax = cols[18]
  const underSized = cols[19]
  const name = cols[35]
  const typeId = cols[36]
  const banner = cols[40]
  const sortKey = cols[39]

  if (!name) continue
  if (instanceType !== '1') continue
  if (!types[typeId]) continue
  if (name.match(/^"活动/)) continue

  data.push({
    index: parseInt(index),
    partySize: partySizeList[partyTypeId],
    level: parseInt(level),
    maxLevel: parseInt(maxLevel),
    ilvMax: parseInt(ilvMax),
    ilvMin: parseInt(ilvMin),
    underSized: underSized.toLowerCase() === 'true',
    name: JSON.parse(name),
    type: types[typeId],
    typeId: parseInt(typeId),
    banner: parseInt(banner),
    sort: parseInt(sortKey)
  })
}

data = data.sort((a, b) => {
  if (a.typeId === b.typeId) {
    return a.sort - b.sort
  } else {
    return a.typeId - b.typeId
  }
})

const result = []
result.push('/* eslint-disable */')
result.push('// generated by instanceList.js')
result.push('module.exports = [')
result.push(data.map(x => JSON.stringify(x)).join(',\n'))
result.push(']')

fs.writeFileSync('../../docs/.vuepress/theme/duty.js', result.join('\n'))

for (const item of data) {
  const filename = `../../docs/duty/${item.index}.md`
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(
      filename,
      `---
underConstruction: true
---
<!-- 攻略完成后请移除本行及以上内容 -->
# ${item.name}

<UnderConstruction />`
    )
  }
}
