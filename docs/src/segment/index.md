# 消息段
> 该理念来自于 icqq

消息段固定格式
\{ type: 消息段类型, data: 消息段数据 \}
- 在使用 **icqq** 的时候，发送消息时，你可以直接发送 **string** 类型的消息，也可以发送指定类型的 **segment**，也可以发送包含 **string** 或 **segment** 的数组
- 在 **kook-client** 中，我们重新定义了 **Sendable** 的约束范围，使得其能获得正确的类型提示
## Sendable
**kook-client** 中 **Sendable** 定义如下：

```typescript
// 重复组合的消息元素

export type MessageSegment=AtSegment|TextSegment|ImageSegment|MarkdownSegment|ReplySegment|FileSegment|CardSegment|VideoSegment|AudioSegment

export type Sendable=string|MessageSegment|Array<string|MessageSegment>
```
- 其中将 **segment** 分为 **可重复消息段**(RepeatableCombineElem)、**不可重复消息段** 和 [回复(ReplyElem)](./reply.md)；
## 组合规则
1. **可重复消息段** 包括：[文本(TextElem)](./text.md)、[表情(FaceElem)](./face.md)、[@(ATElem)](./at.md)、[链接(LinkElem)](./button.md)、[按钮(TextElem)](./button.md)
2. **不可重复消息段** 包括：[图片(ImageElem)](./image.md)、[视频(VideoElem)](./video.md)、[音频(AudioElem)](./audio.md)、[Markdown(MDElem)](./markdown.md)、[Ark(ArkElem)](./ark.md)、[Embed(EmbedElem)](./embed.md)
3. [回复(ReplyElem)](./reply.md) 只能和其他类型的消息段一起使用
4. **可重复消息段** 和 **不可重复消息段** 可以单独发送，也可以携带一个 [回复(ReplyElem)](./reply.md)

- 注意，由于官方尚未支持图文混排，后续支持后，[图片(ImageElem)](./image.md)将会移动到 **可重复消息段**
