import { TransformStrategy } from "./transform.strategy.js";
import { FilterStrategy } from "./filter.strategy.js";
import { EnrichStrategy } from "./enrich.strategy.js";
import { ActionType } from "../../../shared/types.js";
import { ActionStrategy } from "./action.strategy.js";

class ActionRegistry {
  private strategies: Map<ActionType, ActionStrategy>;

  constructor() {
    this.strategies = new Map();

    this.register("transform", new TransformStrategy());
    this.register("filter", new FilterStrategy());
    this.register("enrich", new EnrichStrategy());
  }

  register(type: ActionType, strategy: ActionStrategy) {
    this.strategies.set(type, strategy);
  }

  get(type: ActionType): ActionStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No strategy found for action type: ${type}`);
    }
    return strategy;
  }
}

export const actionRegistry = new ActionRegistry();