---
title: AI 智能体构建总结
slug: ai-agent-building-summary
description: 从概念、执行循环到 OpenManus 拆解，梳理 AI 智能体从理解到落地的一条清晰路径。
pubDate: 2026-04-13
updatedDate: 2026-04-14
series: AI 智能体实践
tags:
  - AI 智能体
  - OpenManus
  - MCP
featured: true
---

## 一句话概括

这篇文章围绕“什么是 AI 智能体、它靠什么工作、怎么使用、怎么拆解开源项目、再到如何自己实现一个简化版 Manus”展开，核心目标是帮助读者从概念理解过渡到工程落地。

## 核心结论

- 智能体不是普通聊天模型的简单包装，而是具备“感知、推理、规划、执行、记忆、反馈调整”能力的 AI 系统。
- 真正让智能体有“自主性”的关键，不是单次回答能力，而是多步推理与工具调用形成的闭环。
- `CoT`、`Agent Loop`、`ReAct`、工具系统、记忆系统，是构建智能体的核心拼图。
- 学习智能体工程的高效路径，不是空讲理论，而是先读成熟开源项目，比如 `OpenManus`。
- 从零实现 Manus 类智能体时，可以先做“简化版”，把核心循环跑通，再逐步补齐工具、记忆、协议支持等能力。

## 1. 什么是智能体

文章把智能体定义为：以大语言模型为核心，集成记忆、知识库、工具调用等能力，能够围绕目标自主完成任务的 AI 系统。

相比普通大模型，智能体多了几项关键能力：

- 感知环境：理解输入和上下文
- 自主规划：把复杂任务拆成多个步骤
- 调用工具：访问搜索、浏览器、代码执行等外部能力
- 多步推理：一步一步分析问题
- 记忆与反馈：基于历史与结果不断修正行为

文章还给出了一个实用分层：

- 反应式智能体：像早期聊天机器人，只会“问一句答一句”
- 有限规划智能体：能做少量多步任务，但路径比较固定
- 自主规划智能体：能围绕目标持续“思考-行动-观察”，典型代表是 `Manus` / `OpenManus` 一类系统

## 2. 智能体为什么能工作

### CoT 思维链

`CoT` 的作用是让模型先拆解问题、再逐步推理。它不是完整智能体，但几乎是复杂任务的基础设施。文章强调，给模型加上“让我们一步一步思考”这类提示，或者提供 few-shot 示例，就能显著改善复杂任务表现。

### Agent Loop 执行循环

这是智能体和普通聊天模型最本质的区别。普通模型通常回答一次就结束；智能体则会在没有新用户输入的情况下继续执行下一步，直到完成任务或达到上限。

它的本质是一个循环：

1. 判断当前状态
2. 选择下一步动作
3. 执行动作
4. 读取结果
5. 再决定下一步

### ReAct 模式

`ReAct = Reasoning + Acting`，也就是“推理 + 行动”。文章把它总结为最常见、也最实用的智能体模式：

- Think：思考当前最该做什么
- Act：调用工具或执行动作
- Observe：读取执行结果
- Repeat：继续循环直到结束

## 3. 智能体能怎么用

文章给了 3 种典型使用方式：

- 平台中使用：例如在阿里云百炼、Dify 这类平台直接创建智能体
- 软件中使用：例如在 `Cursor` 的 Agent 模式里直接体验智能体
- 程序中使用：通过 SDK / API 调用，或者自己基于框架开发

作者还特别指出：即便你的程序已经有大模型、记忆、知识库、工具调用，也不等于它具备了真正的“自主规划与执行能力”。这一点是很多应用和智能体之间的分水岭。

## 4. OpenManus 给了我们什么启发

文章把 `OpenManus` 当作学习案例，强调要“先跑通，再看架构，再读核心源码”。

### 整体架构

`OpenManus` 采用分层代理结构：

- `BaseAgent`：负责基础状态和执行循环
- `ReActAgent`：把单步执行拆成 `think` 和 `act`
- `ToolCallAgent`：让智能体能够调用工具
- `Manus`：集成浏览器、代码执行、人类确认、终止等能力的具体智能体

### 工程上最值得学的点

- 用模板方法模式固定执行骨架，让子类补齐具体行为
- 把推理逻辑和工具执行逻辑分层
- 统一封装工具调用结果，便于观察与回填上下文
- 通过 `MCP` 动态接入远程工具，扩展能力边界
- 用状态管理和循环终止机制防止系统失控

### 最重要的启发

`OpenManus` 的核心并不是“某个神奇提示词”，而是把以下几件事拼在了一起：

- 可循环执行的 Agent 框架
- 稳定的工具系统
- 上下文与记忆管理
- 明确的状态流转
- 对浏览器、代码、MCP 的统一接入

## 5. 如果自己实现一个简化版 Manus，应该怎么做

文章建议先从简化版实现开始，而不是一步到位追求“大而全”。

推荐的最小架构是：

- `BaseAgent`：定义基础字段、执行步数、主循环
- `ReActAgent`：把 `step` 拆成 `think` / `act`
- `ToolCallAgent`：实现工具调用
- `YuManus`：封装成可直接调用的最终智能体实例

#### 首先定义数据模型

目前我们只⁠需要定义 Agen‌t 的状态枚举，用于控制智能体的执行‎。AgentSta‌te 代码如下：

```java
public enum AgentState {  
  
      
    IDLE,  
  
      
    RUNNING,  
  
      
    FINISHED,  
  
      
    ERROR  
}
```

#### 1、开发基础 Agent 类

参考 Op⁠enManus 的‌实现方式，BaseAgent 的代码‎如下：

```java
@Data  
@Slf4j  
public abstract class BaseAgent {  
  
    
    private String name;  
  
    
    private String systemPrompt;  
    private String nextStepPrompt;  
  
    
    private AgentState state = AgentState.IDLE;  
  
    
    private int maxSteps = 10;  
    private int currentStep = 0;  
  
    
    private ChatClient chatClient;  
  
    
    private List<Message> messageList = new ArrayList<>();  
  
      
    public String run(String userPrompt) {  
        if (this.state != AgentState.IDLE) {  
            throw new RuntimeException("Cannot run agent from state: " + this.state);  
        }  
        if (StringUtil.isBlank(userPrompt)) {  
            throw new RuntimeException("Cannot run agent with empty user prompt");  
        }  
        
        state = AgentState.RUNNING;  
        
        messageList.add(new UserMessage(userPrompt));  
        
        List<String> results = new ArrayList<>();  
        try {  
            for (int i = 0; i < maxSteps && state != AgentState.FINISHED; i++) {  
                int stepNumber = i + 1;  
                currentStep = stepNumber;  
                log.info("Executing step " + stepNumber + "/" + maxSteps);  
                
                String stepResult = step();  
                String result = "Step " + stepNumber + ": " + stepResult;  
                results.add(result);  
            }  
            
            if (currentStep >= maxSteps) {  
                state = AgentState.FINISHED;  
                results.add("Terminated: Reached max steps (" + maxSteps + ")");  
            }  
            return String.join("\n", results);  
        } catch (Exception e) {  
            state = AgentState.ERROR;  
            log.error("Error executing agent", e);  
            return "执行错误" + e.getMessage();  
        } finally {  
            
            this.cleanup();  
        }  
    }  
  
      
    public abstract String step();  
  
      
    protected void cleanup() {  
        
    }  
}
```

上述代码中，我们要注意 3 点：

1. 包含 chatClient 属性，由调用方传入具体调用大模型的对象，而不是写死使用的大模型，更灵活
2. 包含 messageList 属性，用于维护消息上下文列表
3. 通过 state 属性来控制智能体的执行流程

#### 2、开发 ReActAgent 类

参考 OpenM⁠anus 的实现方式，继承自 ‌BaseAgent，并且将 step 方法分解为 think‎ 和 act 两个抽象方法。R‌eActAgent 的代码如下：

```java
@EqualsAndHashCode(callSuper = true)  
@Data  
public abstract class ReActAgent extends BaseAgent {  
  
      
    public abstract boolean think();  
  
      
    public abstract String act();  
  
      
    @Override  
    public String step() {  
        try {  
            boolean shouldAct = think();  
            if (!shouldAct) {  
                return "思考完成 - 无需行动";  
            }  
            return act();  
        } catch (Exception e) {  
            
            e.printStackTrace();  
            return "步骤执行失败: " + e.getMessage();  
        }  
    }  java
}
```

#### 3、开发 ToolCallAgent 类

ToolCa⁠llAgent 负责实现‌工具调用能力，继承自 ReActAgent，具体‎实现了 think 和 ‌act 两个抽象方法。

我们有 3 种方案来实现 ToolCallAgent：

1）基于 ⁠Spring AI‌ 的工具调用能力，手动控制工具执行。

其实 Spring 的 ChatClient 已经支持选择工具进行调用（内部完成了 think、act、observe），但这里我们要自主实现，可以使用 Spring AI 提供的 [手动控制工具执行](https://docs.spring.io/spring-ai/reference/api/tools.html#_user_controlled_tool_execution)。

2）基于 ⁠Spring AI‌ 的工具调用能力，简化调用流程。

由于 Spr⁠ing AI 完全托管了‌工具调用，我们可以直接把所有工具调用的代码作为 ‎think 方法，而 a‌ct 方法不定义任何动作。

3）自主实现工具调用能力。

也就是工具调用⁠章节提到的实现原理：自己写‌ Prompt，引导 AI 回复想要调用的工具列表和‎调用参数，然后再执行工具并‌将结果返送给 AI 再次执行。

使用哪种方案呢？

如果是为了学⁠习 ReAct 模式，让‌流程更清晰，推荐第一种；如果只是为了快速实现，推‎荐第二种；不建议采用第三‌种方案，过于原生，开发成本高。

我们还需要定义一‌个终止工具，让智能体可以自行决定任‎务结束。

1）在 tools 包下新建 TerminateTool：

```java
public class TerminateTool {  
  
    @Tool(description = """  
            Terminate the interaction when the request is met OR if the assistant cannot proceed further with the task.  
            "When you have finished all the tasks, call this tool to end the work.  
            """)  
    public String doTerminate() {  
        return "任务结束";  
    }  
}
```

2）修改 ToolRegistration，注册中止工具：

```java
TerminateTool terminateTool = new TerminateTool();  
  
return ToolCallbacks.from(  
        fileOperationTool,  
        webSearchTool,  
        webScrapingTool,  
        resourceDownloadTool,  
        terminalOperationTool,  
        pdfGenerationTool,  
        terminateTool  
);
```

为了学习，我们采⁠用第一种方案实现 ‌ToolCallAgent

```java

/**
 * 处理工具调用的基础代理类，具体实现了 think 和 act 方法，可以用作创建实例的父类
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Slf4j
public class ToolCallAgent extends ReActAgent {

    // 可用的工具
    private final ToolCallback[] availableTools;

    // 保存工具调用信息的响应结果（要调用那些工具）
    private ChatResponse toolCallChatResponse;

    // 工具调用管理者
    private final ToolCallingManager toolCallingManager;

    // 禁用 Spring AI 内置的工具调用机制，自己维护选项和消息上下文
    private final ChatOptions chatOptions;

    public ToolCallAgent(ToolCallback[] availableTools) {
        super();
        this.availableTools = availableTools;
        this.toolCallingManager = ToolCallingManager.builder().build();
        // 禁用 Spring AI 内置的工具调用机制，自己维护选项和消息上下文
        this.chatOptions = DashScopeChatOptions.builder()
                .withInternalToolExecutionEnabled(false)
                .build();
    }

    /**
     * 处理当前状态并决定下一步行动
     *
     * @return 是否需要执行行动
     */
    @Override
    public boolean think() {
        // 1、校验提示词，拼接用户提示词
        if (StrUtil.isNotBlank(getNextStepPrompt())) {
            UserMessage userMessage = new UserMessage(getNextStepPrompt());
            getMessageList().add(userMessage);
        }
        // 2、调用 AI 大模型，获取工具调用结果
        List<Message> messageList = getMessageList();
        Prompt prompt = new Prompt(messageList, this.chatOptions);
        try {
            ChatResponse chatResponse = getChatClient().prompt(prompt)
                    .system(getSystemPrompt())
                    .tools(availableTools)
                    .call()
                    .chatResponse();
            // 记录响应，用于等下 Act
            this.toolCallChatResponse = chatResponse;
            // 3、解析工具调用结果，获取要调用的工具
            // 助手消息
            AssistantMessage assistantMessage = chatResponse.getResult().getOutput();
            // 获取要调用的工具列表
            List<AssistantMessage.ToolCall> toolCallList = assistantMessage.getToolCalls();
            // 输出提示信息
            String result = assistantMessage.getText();
            log.info(getName() + "的思考：" + result);
            log.info(getName() + "选择了 " + toolCallList.size() + " 个工具来使用");
            String toolCallInfo = toolCallList.stream()
                    .map(toolCall -> String.format("工具名称：%s，参数：%s", toolCall.name(), toolCall.arguments()))
                    .collect(Collectors.joining("\n"));
            log.info(toolCallInfo);
            // 如果不需要调用工具，返回 false
            if (toolCallList.isEmpty()) {
                // 只有不调用工具时，才需要手动记录助手消息
                getMessageList().add(assistantMessage);
                return false;
            } else {
                // 需要调用工具时，无需记录助手消息，因为调用工具时会自动记录
                return true;
            }
        } catch (Exception e) {
            log.error(getName() + "的思考过程遇到了问题：" + e.getMessage());
            getMessageList().add(new AssistantMessage("处理时遇到了错误：" + e.getMessage()));
            return false;
        }
    }

    /**
     * 执行工具调用并处理结果
     *
     * @return 执行结果
     */
    @Override
    public String act() {
        if (!toolCallChatResponse.hasToolCalls()) {
            return "没有工具需要调用";
        }
        // 调用工具
        Prompt prompt = new Prompt(getMessageList(), this.chatOptions);
        ToolExecutionResult toolExecutionResult = toolCallingManager.executeToolCalls(prompt, toolCallChatResponse);
        // 记录消息上下文，conversationHistory 已经包含了助手消息和工具调用返回的结果
        setMessageList(toolExecutionResult.conversationHistory());
        ToolResponseMessage toolResponseMessage = (ToolResponseMessage) CollUtil.getLast(toolExecutionResult.conversationHistory());
        // 判断是否调用了终止工具
        boolean terminateToolCalled = toolResponseMessage.getResponses().stream()
                .anyMatch(response -> response.name().equals("doTerminate"));
        if (terminateToolCalled) {
            // 任务结束，更改状态
            setState(AgentState.FINISHED);
        }
        String results = toolResponseMessage.getResponses().stream()
                .map(response -> "工具 " + response.name() + " 返回的结果：" + response.responseData())
                .collect(Collectors.joining("\n"));
        log.info(results);
        return results;
    }
}

```

#### 4、开发 Manus 类

Manus 是⁠可以直接提供给其他方法调用的 AI‌ 超级智能体实例，继承自 ToolCallAgent，需要给智能体设‎置各种参数，比如对话客户端 cha‌tClient、工具调用列表等。

```java
@Component  
public class YuManus extends ToolCallAgent {  
  
    public YuManus(ToolCallback[] allTools, ChatModel dashscopeChatModel) {  
        super(allTools);  
        this.setName("yuManus");  
        String SYSTEM_PROMPT = """  
                You are YuManus, an all-capable AI assistant, aimed at solving any task presented by the user.  
                You have various tools at your disposal that you can call upon to efficiently complete complex requests.  
                """;  
        this.setSystemPrompt(SYSTEM_PROMPT);  
        String NEXT_STEP_PROMPT = """  
                Based on user needs, proactively select the most appropriate tool or combination of tools.  
                For complex tasks, you can break down the problem and use different tools step by step to solve it.  
                After using each tool, clearly explain the execution results and suggest the next steps.  
                If you want to stop the interaction at any point, use the `terminate` tool/function call.  
                """;  
        this.setNextStepPrompt(NEXT_STEP_PROMPT);  
        this.setMaxSteps(20);  
        
        ChatClient chatClient = ChatClient.builder(dashscopeChatModel)  
                .defaultAdvisors(new MyLoggerAdvisor())  
                .build();  
        this.setChatClient(chatClient);  
    }  
}
```

一个合理的开发顺序是：

1. 先让单步循环能跑通
2. 再接入工具调用
3. 再补充记忆、日志、异常处理
4. 最后再考虑 `MCP`、多智能体、工作流编排

文章也给了一个很务实的判断：如果只是想快速做出效果，可以借助 `Spring AI` 这类框架；如果是为了真正理解智能体底层机制，自己实现一版会学得更扎实。

## 6. 扩展知识：工作流、OWL、A2A

### 智能体工作流

文章把复杂任务下的多智能体编排总结成几类常见模式：

- Prompt Chaining：链式分步处理
- Routing：按任务类型分流
- Parallelization：并行执行后聚合
- Orchestrator-Workers：调度者拆任务，多个执行者完成
- Evaluator-Optimizer：生成、评估、再优化

这部分的重点是：当单个智能体不够用时，可以把问题转成“工作流编排问题”。

### LangGraph / Spring AI Alibaba Graph

这两个框架代表了智能体工作流的工程化方向：

- `LangGraph` 更适合复杂状态图、循环与分支控制
- `Spring AI Alibaba Graph` 更适合 Java / Spring 生态下快速落地

### OWL

`OWL` 被介绍为一个偏“多智能体 + 工具自动化”的实用框架，优势在于：

- 多智能体协作
- 丰富工具集成
- 支持 `MCP`
- 有本地 Web UI，方便调试

### A2A 协议

这部分是全文很重要的补充：

- `MCP` 解决的是“智能体如何调用工具”
- `A2A` 解决的是“智能体之间如何通信和协作”

文章把 `A2A` 类比成智能体世界里的 `HTTP`。它更偏向未来基础设施，目前值得先理解概念和应用场景，但不必急着投入实现。

## 7. 这篇文章最值得带走的 8 个要点

1. 智能体的核心不是会聊天，而是会围绕目标持续行动。
2. `CoT` 提供推理基础，但真正让系统“动起来”的是 `Agent Loop`。
3. `ReAct` 是当前最主流、也最容易落地的智能体模式。
4. 工具调用能力几乎决定了智能体的上限。
5. `OpenManus` 这类项目最值得学的是架构组织，不只是代码片段。
6. 自己实现智能体时，应先做简化版，再逐步补强。
7. 当任务复杂到单个 Agent 扛不住时，就该考虑工作流编排或多智能体协作。
8. `MCP` 和 `A2A` 分别对应“工具互联”和“智能体互联”，未来会越来越重要。

## 个人建议版学习路径

- 第一步：先理解 `CoT`、`Agent Loop`、`ReAct`
- 第二步：读一遍 `OpenManus` 的分层结构
- 第三步：自己实现一个最小版 `BaseAgent -> ReActAgent -> ToolCallAgent`
- 第四步：接入一个浏览器工具和一个代码执行工具
- 第五步：再去学 `MCP`、工作流框架、多智能体协作



