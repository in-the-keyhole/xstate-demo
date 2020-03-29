import * as React from "react";

import { useMachine } from "@xstate/react";
import { toggleMachine, ToggleEvent } from "./toggleMachine";

const Buttons = ({ send }: { send: (event: ToggleEvent["type"]) => void }) => (
  <>
    <button onClick={() => send("TOGGLE")}>Send TOGGLE</button>
    <button onClick={() => send("BANANA")}>Send BANANA</button>
  </>
);

export const Toggler: React.FC = () => {
  const [state, send] = useMachine(toggleMachine);

  switch (state.value) {
    case "active":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          State is ACTIVE!
          <Buttons send={send} />
        </div>
      );

    case "inactive":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          State is INACTIVE!
          <Buttons send={send} />
        </div>
      );

    default:
      return null;
  }
};
