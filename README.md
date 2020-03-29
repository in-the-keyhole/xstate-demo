# An Introduction to State Machines using xstate

State machines are an old concept. They are a proven solution that provides a solid architectural foundation for application processes. In this article, I hope to provide an introduction to what they are and how they can be useful for a modern web or mobile application engineer. We'll be focusing on one library in particular - [xstate](xstate.org) - and how it can allow anyone to easily leverage state machines for managing global or component state.

## What are State Machines?

### Definition of a State Machine

State machines allow for encapsulation of the specific states an application can be in at any given time. The definition of any given state machine consists of a few specific items. These include:

1. A set of given states (one of which is the initial state, and possibly a final state)
2. A number of events (these allow for transitions between the states)
3. Transition functions that take an event and then output the next state

Even foregoing the actual mathematical model and specification that defines the concept of a state machine ([more here](https://en.wikipedia.org/wiki/Finite-state_machine)), these points can seem a bit dry. I have found it easiest to learn by example. Let's take a look at a simple state machine and break it down.

### A Simple Example

![Toggle Machine Image](togglemachine.png "Toggle Machine")

Here we have a visual representation of a simple state machine that has two defined states (`inactive` and `active`). In this machine, the initial state is `inactive`; it does not have a final state. The only event is `TOGGLE` which, when sent to the machine, will transition it to the only other state that can occur: `active`. Once transitioned to `active`, the `TOGGLE` event can only transition the machine to `inactive`. This will proceed back and forth indefinitely, hence the lack of a final state.

You can view the example online [here](https://xstate.js.org/viz/?gist=bd2b2f9caf3838f1c2f0a58bbf2101bc). This is using a tool called the xstate visualizer, which allows you to interact with state machines. Try clicking the `TOGGLE` event and watch the machine transition to `active` and back to inactive. Try adding another state or changing the name of the event and you can see the visual update as you make changes.

## How are they useful?

To get right down to it, I think the most important feature of state machines compared to other state management solutions is the fact that the machine can only exist in one state at a time, and therefore can only transition to another state if that state is accessible via one of the events. This restriction alone makes all the difference. It prevents invalid states from being reached at any point in time. It also allows for type-safe assertions of what data is available in the state context based on the current state of the machine. In applications using a library like `xstate`, this translates to type-safe, declarative configuration for the state of the application, and fewer bugs attributable to component architecture, race conditions, or user input.

Let's look at an example of this is a real (trivial) application, using our Toggle example from above.

> The code referenced in this example is available [here](https://github.com/in-the-keyhole/xstate-demo)

### The Machine

```typescript
import { createMachine } from "xstate";

interface ToggleContext {}

type ToggleEvent = { type: "TOGGLE" } | { type: "BANANA" };

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
```

The first thing you may notice is that this is written using TypeScript. TypeScript is encouraged for use with state machines. There are some benefits when consuming the machine that come from type-narrowing in TypeScript, but that's a bit outside the scope of this article. For more, check out the great [documentation](https://xstate.js.org/docs/guides/typescript.html#using-typescript).

The second modification we've made is to our `inactive` state - an event we're calling `BANANA`. Because this event is declared within the `inactive` state, it will only trigger a transition when the application is in the `inactive` state. This is POWERFUL, folks. It means that there is no accidental transitioning unless the event itself is reachable.

### States & Events

In our `Toggler` component, we use an import from `@xstate/react` to consume our state machine config and give us access to the values or our state and a method to allow us to send events.

```typescript
const [state, send] = useMachine(toggleMachine);
```

We can use the `state` in our application as the following lines show:

```
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
```

We can simply switch on the state value, and return the appropriate JSX. We'll show some text to let the user know what state we're in at the time.

We can also use the `send` function like any other callback. In this case, we're going to pass it down to our `Buttons` component so we can click on the different buttons to send events to the state machine.

The `Buttons` component looks like this:

```jsx
const Buttons = ({ send }: { send: (event: ToggleEvent["type"]) => void }) => (
  <>
    <button onClick={() => send("TOGGLE")}>Send TOGGLE</button>
    <button onClick={() => send("BANANA")}>Send BANANA</button>
  </>
);
```

Note that we can click to send either event at any time. There is no built-in restriction to limit the firing of events. This is fine. However, whichever state we're in at the time determines whether the event will have an effect. As we discussed above, only certain events are valid at a given time based on the state. Try running the application and clicking on the buttons to fire the events. If we're in the `inactive` state, the `BANANA` event will result in a transition to the `active` state. If we're in the `active` state, the `BANANA` event will have no effect. You can change the name of the event or states in the machine, and see the changes ripple through the type definitions up to the application and affect what happens at any point in the machine.

## Some Thoughts on State Management

This has been a brief introduction to using state machines with the xstate library and an example React application. It by no means covers the depth of the library or state machine concepts in general. There's a lot there, and the [docs](https://xstate.js.org/docs/) already do a great job of providing examples and linking to reference documentation about state machine concepts and the underlying SCXML specification. If you want something to nerd out on over a weekend, there's plenty there for you.

One thing that I hope is clear is that there is a simple but important distinction between state machines and a library such as `xstate` versus any other state management solution (such as Redux, or even `useState` or `useReducer` within React). The simple restrictions put on how states can be traversed with a state machine provide a "path" through the workflow of any given application, in a way that is not present with other methods. This allows for easier development, as it's simpler for you to work with as a developer and know "where you are" in an application. It also proves more digestible by tools (like the visualizer we looked at in the beginning of this post) - it is based on a serializable spec, after all.

## Conclusion

I hope you enjoyed this article - if you didn't, or would like to offer any constructive criticism, please get ahold of me in the comments section or ping me on Twitter [@mwarger](twitter.com/mwarger). I'm also happy to answer any questions. The xstate library is useful across any number of javascript-based environments, so if you need help integrating this into your own workflow, hit up Keyhole and we'll get you sorted out.

I hope to follow this with a number of posts about different fun uses of state machines. If that sounds cool to you, let me know in the comments below. Thanks for reading.
