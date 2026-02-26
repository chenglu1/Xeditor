# 🚀 AI 生成内容 — 流式输出演示

> 本文由 AI 模型以 **token-by-token** 的方式流式输出，展示编辑器对增量 Markdown 渲染的支持。

---

## 1. 基本格式

Markdown 支持多种行内样式：**粗体强调**、*斜体*、~~删除线~~、`行内代码` 以及 [超链接](https://github.com)。

还可以使用 ==高亮文本== 来突出重要内容，以及上标 H~2~O 和下标 X^2^ 等科学记号。

组合使用也没问题：***粗斜体*** 和 ~~**粗体删除线**~~。

---

## 2. 数学公式

### 行内公式

著名的质能方程 $E = mc^2$ 由爱因斯坦提出。欧拉公式 $e^{i\pi} + 1 = 0$ 被称为数学中最优美的等式。

二次方程 $ax^2 + bx + c = 0$ 的求根公式为 $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$。

### 块级公式

麦克斯韦方程组（微分形式）：

$$
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}
$$

$$
\nabla \cdot \mathbf{B} = 0
$$

标准正态分布的概率密度函数：

$$
f(x) = \frac{1}{\sqrt{2\pi}\sigma} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

矩阵乘法示例：

$$
\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} e \\ f \end{pmatrix} = \begin{pmatrix} ae + bf \\ ce + df \end{pmatrix}
$$

---

## 3. 列表

### 无序列表

- 📦 第一项：支持 Markdown 编辑
- 🎨 第二项：实时富文本预览
- ⚡ 第三项：流式输出场景

### 有序列表

1. 首先初始化编辑器实例
2. 然后监听流式数据回调
3. 逐步将 token 追加到 Markdown 文本
4. 编辑器自动将新增内容渲染为富文本

### 任务列表

- [x] 初始化编辑器组件
- [x] 实现 Markdown 解析与渲染
- [x] 添加工具栏操作按钮
- [x] 支持数学公式渲染
- [ ] 优化流式场景下的性能
- [ ] 支持更多扩展功能

---

## 4. 引用块

> **提示**：流式渲染在 AI 对话、代码生成、文档写作等场景中广泛使用。
>
> 编辑器需要在内容不断增长的过程中保持稳定的排版和流畅的滚动体验。

### 嵌套引用

> 这是外层引用
>
> > 这是嵌套引用，用于展示多层引用结构的渲染效果。
> >
> > 包含行内公式 $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$ 也没问题。
>
> 回到外层引用。

---

## 5. 代码块

下面是一段 TypeScript 示例代码：

```typescript
interface StreamConfig {
  /** 每个 token 的输出间隔 (ms) */
  interval: number;
  /** 每次追加的字符数 */
  chunkSize: number;
  /** 完整的 Markdown 源文本 */
  source: string;
}

async function streamMarkdown(config: StreamConfig) {
  const { interval, chunkSize, source } = config;
  let position = 0;

  while (position < source.length) {
    const chunk = source.slice(position, position + chunkSize);
    position += chunkSize;
    editor.setValue(prev => prev + chunk);
    await sleep(interval);
  }
}
```

再来一段 Python 示例：

```python
import asyncio

async def stream_response(prompt: str):
    """模拟大模型流式输出"""
    response = await llm.generate(prompt, stream=True)
    buffer = ""
    async for token in response:
        buffer += token
        yield buffer  # 逐步输出累积内容
```

---

## 6. 表格

| 功能 | 说明 | 状态 |
| --- | --- | --- |
| 标题 H1-H6 | 多级标题渲染 | ✅ 已支持 |
| 粗体 / 斜体 | 行内文字样式 | ✅ 已支持 |
| 代码块 | 语法高亮显示 | ✅ 已支持 |
| 表格 | 多列数据展示 | ✅ 已支持 |
| 数学公式 | KaTeX 渲染 | ✅ 已支持 |
| 高亮文本 | 标记重要内容 | ✅ 已支持 |
| 上标 / 下标 | 科学记号 | ✅ 已支持 |
| 任务列表 | 待办事项 | ✅ 已支持 |
| 流式输出 | 增量追加渲染 | 🔄 演示中 |

---

## 7. 嵌套结构

### 多层嵌套列表

- 前端技术栈
  - 框架：React 18
  - 编辑器：TipTap v3
  - 构建：Vite 5
- 后端集成
  - API 对接
  - 流式 SSE 推送
  - 缓存策略
- 数学公式支持
  - 行内公式：$\alpha + \beta = \gamma$
  - 块级公式：KaTeX 渲染引擎
  - LaTeX 语法完整支持

---

## 8. 综合展示

以下段落综合使用了多种 Markdown 元素：

在机器学习中，**梯度下降** 是最常用的优化算法之一。其核心更新公式为 $\theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)$，其中 $\eta$ 是 ==学习率==，$\nabla L$ 是损失函数的梯度。

常见的损失函数包括：

1. **均方误差** (MSE)：$L = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$
2. **交叉熵损失**：$L = -\sum_{i} y_i \log(\hat{y}_i)$
3. **Huber 损失**：兼顾 MSE 和 MAE 的优点

> 💡 **小贴士**：选择合适的学习率 $\eta$ 至关重要——太大会导致震荡，太小则收敛缓慢。

---

*✨ 流式输出完毕 — 感谢体验 Xeditor！*
