import { ASTYNode, ASTQQueryNodeData } from './asty';

declare class ASTQ<Node = any> {

  /**
   * Create a new ASTQ instance.
   */
  constructor();

  /**
   * Register one or more custom tree access adapter(s) to support arbitrary
   * AST-style data structures. 
   *
   * The `ASTQAdapter` has to conform to a particular duck-typed interface. See
   * below for more information. 
   *
   * By default ASTq has built-in adapters for ASTy, XML DOM, Parse5, Cheerio,
   * JSON and Mozilla AST. All those "taste" the node passed to `ASTQ#query` and
   * hence are auto-selected. 
   *
   * Calling `adapter()` causes these to be replaced with a single custom
   * adapter. 
   *
   * Its "tasting" can be disabled with option `force` set to `true`. The
   * `ASTQ#adapter` returns the API itself.
   *
```js
// the built-in implementation for supporting ASTy 
astq.adapter({
  taste:            function (node)       { return (typeof node === "object" && node.ASTy) },
  getParentNode:    function (node, type) { return node.parent()  },
  getChildNodes:    function (node, type) { return node.childs()  },
  getNodeType:      function (node)       { return node.type()    },
  getNodeAttrNames: function (node)       { return node.attrs()   },
  getNodeAttrValue: function (node, attr) { return node.get(attr) }
})
```
   */
  adapter(adapter: ASTQAdapter<Node> | ASTQAdapter<Node>[], force?: boolean): ASTQ;

  /**
   * Return the current ASTQ library version details.
   */
  version(): { major: number, minor: number, micro: number, date: number };

  /**
   * Register function named name by providing the callback func which has to
   * return an arbitrary value and optionally can access the current node with
   * the help of the selected adapter. Returns the API itself.
   *
```js
// the built-in implementation for "depth"  
astq.func("depth", function (adapter, node) => {
  var depth = 1
  while ((node = adapter.getParentNode(node)) !== null)
      depth++
  return depth
})
```
   */
  func(name: string, func: (adapter: ASTQAdapter<Node>, node: Node, ...args: any[]) => any): ASTQ;

  /**
   * Set the upper limit for the internal query cache to `num`, i.e., up to
   * `num` ASTs of parsed queries will be cached. 
   *
   * Set `num` to 0 to disable the cache at all. Returns the API itself.
   */
  cache(num: number): ASTQ;

  /**
   * Compile `selector` DSL into an internal query object for subsequent
   * processing by `execute`. If [trace] is `true` the compiling is dumped
   * to the console. . Also it could be a [[TraceListener]] function in
   *  which case nothing will be printed in console
   * and instead it will be notified with [[StepTraceEvent]] events. 
   * Returns the query object.
   */
  compile(selector: string, trace?: boolean | TraceListener<Node>): ASTQQuery<Node>;

  /**
   * Execute the previously compiled `query` (see compile above) at `node`. The
   * optional `params` object can provide parameters for the {name} query
   * constructs. If `trace` is `true` the execution is dumped to the console.
   * Also it could be a [[TraceListener]] function in which case nothing will be printed in console
   * and instead it will be notified with [[StepTraceEvent]] events. 
   * Returns an array of zero or more matching AST nodes.
   */
  execute(node: Node, query: ASTQQuery<Node>, params?: any, trace?: boolean | TraceListener<Node>): Node[];

  /**
   * Just the convenient combination of compile and execute: 
   * 
   * `execute(node, compile(selector, trace), params, trace)`. 
   *
   * Use this as the standard query method except you need more control. The
   * optional [[params]] object can provide parameters for the {name} query
   * constructs. If [[trace]] is true the compiling and execution is dumped to the
   * console. Also it could be a [[TraceListener]] function in which case nothing will be printed in console
   * and instead it will be notified with [[StepTraceEvent]] events. 
   * 
   * Returns an array of zero or more matching AST nodes.
   */
  query(node: Node, selector: String, params?: any, trace?: boolean | TraceListener<Node>): Node[];
}

export type TraceListener<Node = any> = (e: StepTraceEvent<Node>) => void

export interface StepTraceEvent<Node = any> {
  /**
   * User node's depth in its AST
   */
  nodeDepth: number,

  /**
   * Query node's depth in its AST
   */
  queryNodeDepth: number

  /*** 
   * bucket for user meta data 
   */
  meta?: any

  /**
  * `startSearch` means just before the (entire) search starts, and `finishSearch` the contrary
  * `beginStep` means just before user node is being filter by current step according to `queryNode` 
  * `endStep` means when all the input nodes for this step where filtered and the step is done, At 
  * this point the total step time is measured and the final node list resulting from this step is 
  * also, which will be in turn be next step input or the final result if this is the last step.
  * `finishCompile` and `startCompile` events but with less data, relevant: query ast and searchtotaltime
  */
  event: "beginStep" | "endStep" | 'finishSearch' | 'startSearch' | 'startCompile' | 'finishCompile'

  /**
   * Query AST node being processing user nodes at this step.
   */
  queryNode: ASTYNode

  /**
   * User Node being processed at this moment. 
   */
  node: Node

  /**
  * Timestamp taken when the query step begin or ended, so when joining all query steps it's possible
  * to obtain the number of milliseconds it took. 
  */
  timestamp: number

  /**
  * Friendly msg representing this step state
  */
  traceMsg?: string

  /**w
   * Current nodes matches at the end of this step. 
   * These nodes will be the input for the next step. 
   * This property is only defined for event=="endStep"
   */
  matches?: Node[]

  totalSearchTime?: number

  /** 
   * Available when event === 'finishCompile'. Serialized query AST as string generated when compile ends. 
   */
  queryAst?: string

  /**
   * Available when event === 'finishCompile'
   * 
   */
  totalCompileTime?: number
}

/**
 * For accessing arbitrary AST-style data structures, an adapter has to be
 * provided. By default ASTq has adapters for use with ASTy, XML DOM, Parse5 and
 * Mozilla AST. 
 * 
 * **IMPORTANT** Types are strictly checked, and in particular getParentNode and getNodeAttrValue
 * must return exactly null if there is no value. Other falsy values will be consider as  
 * non-null and could cause infinite recursion. 
 */
export interface ASTQAdapter<Node = any> {
  /**
   * Taste node to be sure this adapter is intended to handle it.
   */
  taste(node: any): boolean;

  /**
   * Return parent node of `node`. In case the underlying data structure
   * does not support traversing to parent nodes, throw an exception.
   */
  getParentNode(node: Node): Node | null;

  /**
   * Return the list of all child nodes of `node`.
   */
  getChildNodes(node: Node): Node[];

  /**
   * Return the type of `node`.
   */
  getNodeType(node: Node): string | null;

  /**
   * Return the list of all attribute names of `node`.
   */
  getNodeAttrNames(node: Node): string[];

  /**
   * Return the value of attribute `attr` of `node`.
   */
  getNodeAttrValue(node: Node, attr: string): any | null;
}


export interface ASTQQuery<Node = any> {
  /** 
   * Compile query selector into AST.
   */
  compile(selector: string, trace?: boolean): ASTQQuery;

  /** 
   * Dumps the query AST.
   */
  dump(): string;

  /**
   * Internal query's AST object builded when compiled. 
   * @internal
   */
  ast: ASTYNode

  /**
   * Serializes this query instance as a json string.
   */
  serialize(): string

  /**
   * Same as [[serialize]] but it returns the JSON parsed object.
   */
  toJSONObject(): ASTQQueryNodeData

  /**
   * Execute the query AST onto `node`.
   */
  execute(node: Node, adapter: ASTQAdapter<Node>, params: any[], funcs: any[], trace?: boolean): Node[];
}

export default ASTQ


export * from './asty'