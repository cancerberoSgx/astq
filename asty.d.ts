export type QueryExpressions = 'Query' | 'Path' | 'Step' | 'Step' | 'Axis' | 'Match' | 'Match' | 'Match' | 'Filter' | 'ConditionalBinary' | 'ConditionalTernary' | 'Logical' | 'Logical' | 'Bitwise' | 'Bitwise' | 'Bitwise' | 'Relational' | 'Bitwise' | 'Arithmetical' | 'Arithmetical' | 'Unary' | 'FuncCall' | 'Attribute' | 'Attribute' | 'Param' | 'Identifier' | 'LiteralString' | 'LiteralString' | 'LiteralRegExp' | 'LiteralNumber' | 'LiteralNumber' | 'LiteralNumber' | 'LiteralNumber' | 'LiteralNumber' | 'LiteralValue' | 'LiteralValue' | 'LiteralValue' | 'LiteralValue' | 'LiteralValue';


/**
* Internal Node implementation of the query's AST. https://github.com/rse/asty
* @internal
* */
export interface ASTYNode extends ASTQQueryNodeData {
  /**
   * Add one or more childs to a node, at the end of the child list. The array childs can either contain
   * ASTYNode objects or even arrays of ASTYNode objects.
   */
  add(...childs: ASTYNode[]): ASTYNode;

  /**
   * Gets all attributes names.
   */
  attrs(): string[];

  /**
   * Gets child node at given index.
   */
  child(pos: number): ASTYNode | undefined;

  /**
   * Get a nodes list of all or some childs. The begin and end parameters are passed-through to Array::slice.
   * If the range from begin to end is out of range, an empty array is returned.
   */
  childs(begin?: number, end?: number): ASTYNode[];

  /**
   * Sets children nodes.
   */
  childs(c: ASTYNode[]): ASTYNode;

  /**
   * Create a new ASTYNode instance of type and optionally already set attributes and add child nodes.
   */
  create(type: string, attrs?: ASTYNodeAttrs, childs?: ASTQQueryNodeData[]): ASTYNode;

  /**
   * Removes children.
   */
  del(...ASTQQueryNode: any[]): any;

  /**
   *   Recursively walk the AST starting at this node (at depth 0). For each visited node the `callback`
   *   function is called with the current node, the current node's tree depth, the current node's parent node
   *   and the current walking situation.  By default (and if `when` is either `downward` or `both`), the
   *   callback is called in the downward phase, i.e., before(!) all child nodes will be visited, and with
   *   `when` set to `downward`. If `when` is set to `upward` or `both`, the callback is called in the upward
   *   phase, i.e., after(!) all child nodes were visited, and with `when` set to `upward`.
   */
  dump(maxDepth?: number, colorize?: (type: string, txt: string) => string, unicode?: boolean): string;

  /**
   * Gets attribute's value.
   * */
  get(name: string): any;

  /**
   * Add one or more childs to a node, at a fixed position `pos`. The array `childs` can either contain
   * ASTYNode objects or even arrays of ASTYNode objects. If `pos` is negative it counts from the end of child
   * list, with `-1` the position after the last existing child.
   */
  ins(pos: number, ...args: ASTYNode[]): ASTYNode;

  /**
   *   Recursively walk the AST starting at this node (at depth 0). For each visited node the `callback`
   *   function is called with the current node, the current node's tree depth, the current node's parent node
   *   and the current walking situation.  By default (and if `when` is either `downward` or `both`), the
   *   callback is called in the downward phase, i.e., before(!) all child nodes will be visited, and with
   *   `when` set to `downward`. If `when` is set to `upward` or `both`, the callback is called in the upward
   *   phase, i.e., after(!) all child nodes were visited, and with `when` set to `upward`.
   */
  walk(callback: (node: ASTYNode, depth: number, parent: ASTYNode, when: string) => void, when?: string): ASTYNode;

  /**
   *  Merge attributes, childs and optionally the position of a node. The attributes can be renamed or skipped
   *  (if mapped onto null).
   */
  merge(node: ASTYNode, takePos: boolean, attrMap?: ASTYNodeAttrs): ASTYNode;

  /**
   * Get position among sibling nodes in parent's child node list. The positions start at 0.
   */
  nth(): number;

  /**
   *  Get parent node.
   */
  parent(): ASTYNode | null;

  /**
   * Sets the node's position.
   */
  pos(line: number, column: number, offset: number): ASTYNode;

  /**
   * Gets the node's position.
   */
  pos(): ASTYNodeAttrsPosition;

  /**
   *  Recursively serializes the AST node to JSON. Use this for exporting.
   */
  serialize(): string;

  /**
   * Sets the value of an attribute.
   */
  set(name: string, val: any): ASTYNode;

  /**
  * Sets multiple attributes to their corresponding value.
  */
  set(attrs: ASTYNodeAttrs): ASTYNode;

  /**
   * Gets the node's type.
   */
  type(): QueryExpressions;

  /**
   * Sets the node's type.
   */
  type(t: QueryExpressions): ASTYNode;

  /**
   * Un-sets the value of an attribute
   */
  unset(name: string): ASTYNode;

  /**
   * Un-sets the value of an attribute
   */
  unset(attrs: string[]): ASTYNode;

}

interface ASTYNodeAttrsPosition {
  line: number;

  column: number;

  offset: number;

}

interface ASTYNodeAttrs {
  [name: string]: any;

}

/**
* Serialized version of `ASTYNode` Format of ASTYNode.serialize output string
* @internal
* */
export interface ASTQQueryNodeData {
  /**
   * Node's type name.
   */
  T: string;

  /**
   * Node's location in the initial query string
   */
  L: ASTQQueryNodeDataLocation;

  /**
   * Node's children
   */
  C: ASTQQueryNodeData[];

  /**
   * Node's attributes
   */
  A: ASTYNodeAttrs;

}

interface ASTQQueryNodeDataLocation {
  /**
   * Line number
   */
  L: number;

  /**
   * Column number
   */
  C: number;

  /**
   * Offset
   */
  '0': number;

}
