interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * JSON-LD 结构化数据组件
 * 用于在页面中注入 Schema.org 结构化数据
 *
 * @example
 * // 单个 Schema
 * <JsonLd data={generateArticleJsonLd({ ... })} />
 *
 * // 多个 Schema（使用 @graph）
 * <JsonLd data={combineJsonLd(schema1, schema2)} />
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * 多个独立 JSON-LD 数据组件
 * 用于在页面中注入多个独立的结构化数据块
 */
export function MultiJsonLd({ items }: { items: Record<string, unknown>[] }) {
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
