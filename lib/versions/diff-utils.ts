// 简单的文本差异对比工具

export interface DiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

// 按行对比两个文本
export function diffLines(oldText: string, newText: string): DiffPart[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  const result: DiffPart[] = []

  // 使用简单的 LCS (最长公共子序列) 算法
  const lcs = computeLCS(oldLines, newLines)

  let oldIndex = 0
  let newIndex = 0
  let lcsIndex = 0

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (lcsIndex < lcs.length && oldIndex < oldLines.length && oldLines[oldIndex] === lcs[lcsIndex]) {
      // 匹配 LCS，检查新文本
      while (newIndex < newLines.length && newLines[newIndex] !== lcs[lcsIndex]) {
        result.push({ value: newLines[newIndex] + '\n', added: true })
        newIndex++
      }
      result.push({ value: oldLines[oldIndex] + '\n' })
      oldIndex++
      newIndex++
      lcsIndex++
    } else if (oldIndex < oldLines.length) {
      // 旧文本中有但 LCS 中没有，说明被删除
      result.push({ value: oldLines[oldIndex] + '\n', removed: true })
      oldIndex++
    } else if (newIndex < newLines.length) {
      // 新文本中有但旧文本中没有，说明是新增
      result.push({ value: newLines[newIndex] + '\n', added: true })
      newIndex++
    }
  }

  return result
}

// 计算最长公共子序列
function computeLCS(arr1: string[], arr2: string[]): string[] {
  const m = arr1.length
  const n = arr2.length

  // 创建 DP 表
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  // 填充 DP 表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // 回溯找出 LCS
  const lcs: string[] = []
  let i = m, j = n

  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcs
}

// 统计变更
export function getDiffStats(diff: DiffPart[]) {
  let additions = 0
  let deletions = 0

  for (const part of diff) {
    const lines = part.value.split('\n').length - 1
    if (part.added) additions += lines
    if (part.removed) deletions += lines
  }

  return { additions, deletions }
}

// 格式化差异为 HTML
export function formatDiffAsHtml(diff: DiffPart[]): string {
  return diff.map(part => {
    const escaped = escapeHtml(part.value)
    if (part.added) {
      return `<span class="diff-added">${escaped}</span>`
    }
    if (part.removed) {
      return `<span class="diff-removed">${escaped}</span>`
    }
    return `<span class="diff-unchanged">${escaped}</span>`
  }).join('')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
