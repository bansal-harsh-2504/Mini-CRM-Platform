function parseRulesToMongoQuery(ruleNode) {
  if (ruleNode.condition) {
    // it's a group
    const subQueries = ruleNode.rules.map(parseRulesToMongoQuery);
    if (ruleNode.condition === "AND") {
      return { $and: subQueries };
    } else if (ruleNode.condition === "OR") {
      return { $or: subQueries };
    }
  } else {
    // it's a single rule
    const { field, operator, value } = ruleNode;
    switch (operator) {
      case ">":
        return { [field]: { $gt: value } };
      case "<":
        return { [field]: { $lt: value } };
      case ">=":
        return { [field]: { $gte: value } };
      case "<=":
        return { [field]: { $lte: value } };
      case "==":
        return { [field]: value };
      case "!=":
        return { [field]: { $ne: value } };
      default:
        throw new Error("Unsupported operator");
    }
  }
}
export default parseRulesToMongoQuery;
