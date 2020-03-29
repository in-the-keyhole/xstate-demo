import { createMachine } from "xstate";

interface ToggleContext {}

export type ToggleEvent = { type: "TOGGLE" } | { type: "BANANA" };

type ToggleState =
  | {
      value: "inactive";
      context: ToggleContext;
    }
  | {
      value: "active";
      context: ToggleContext;
    };

export const toggleMachine = createMachine<
  ToggleContext,
  ToggleEvent,
  ToggleState
>({
  id: "toggle",
  initial: "active",
  states: {
    inactive: {
      on: { TOGGLE: "active", BANANA: "active" }
    },
    active: {
      on: { TOGGLE: "inactive" }
    }
  }
});
