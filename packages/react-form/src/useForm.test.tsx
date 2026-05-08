import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useForm } from "./useForm";

describe("useForm", () => {
  it("register() returns correct props for a field", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { email: "test@example.com" } })
    );

    const props = result.current.register("email");

    expect(props.name).toBe("email");
    expect(props.id).toBe("rfrm-field-email");
    expect(props.value).toBe("test@example.com");
    expect(typeof props.onChange).toBe("function");
    expect(typeof props.onBlur).toBe("function");
    expect(typeof props.ref).toBe("function");
  });

  it("register() wires aria-invalid and aria-describedby", async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: "" },
        validate: () => ({ email: "Required" }),
        validateOn: "submit",
      })
    );

    // Trigger validation via submit
    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    const props = result.current.register("email");
    expect(props["aria-invalid"]).toBe("true");
    expect(props["aria-describedby"]).toContain("rfrm-field-email-error");
  });

  it("register() wires aria-required when options.required is set", () => {
    const { result } = renderHook(() => useForm());

    const props = result.current.register("name", { required: true });
    expect(props["aria-required"]).toBe("true");
  });

  it("setValue updates formState values and dirtyFields", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { name: "Alice" } })
    );

    act(() => {
      result.current.setValue("name", "Bob");
    });

    expect(result.current.watch("name")).toBe("Bob");
    expect(result.current.formState.dirtyFields.name).toBe(true);
  });

  it("setValue marks field not dirty when value matches default", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { name: "Alice" } })
    );

    act(() => {
      result.current.setValue("name", "Bob");
    });

    act(() => {
      result.current.setValue("name", "Alice");
    });

    expect(result.current.formState.dirtyFields.name).toBe(false);
  });

  it("watch() returns current value for named field", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { count: 42 } })
    );

    expect(result.current.watch("count")).toBe(42);
  });

  it("watch() with no argument returns all values", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { a: 1, b: 2 } })
    );

    const all = result.current.watch() as Record<string, unknown>;
    expect(all.a).toBe(1);
    expect(all.b).toBe(2);
  });

  it("watch() returns updated value after setValue", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { x: "hello" } })
    );

    act(() => {
      result.current.setValue("x", "world");
    });

    expect(result.current.watch("x")).toBe("world");
  });

  it("validation runs on submit and sets errors", async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: "" },
        validate: (vals) => {
          const errs: Record<string, string> = {};
          if (!vals.email) errs.email = "Email is required";
          return errs;
        },
      })
    );

    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.formState.errors.email).toBe("Email is required");
  });

  it("onSubmit is called with values when validation passes", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: "user@example.com" },
        onSubmit,
      })
    );

    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      { email: "user@example.com" },
      expect.objectContaining({ reset: expect.any(Function) })
    );
  });

  it("onError is called when validation fails", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { name: "" },
        validate: () => ({ name: "Required" }),
        onError,
      })
    );

    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(onError).toHaveBeenCalledWith({ name: "Required" });
  });

  it("onSubmit is NOT called when validation fails", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { name: "" },
        validate: () => ({ name: "Required" }),
        onSubmit,
      })
    );

    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("setError adds an error manually", () => {
    const { result } = renderHook(() => useForm());

    act(() => {
      result.current.setError("email", "Already taken");
    });

    expect(result.current.formState.errors.email).toBe("Already taken");
    expect(result.current.formState.isValid).toBe(false);
  });

  it("clearErrors removes a specific error", () => {
    const { result } = renderHook(() => useForm());

    act(() => {
      result.current.setError("email", "Error");
      result.current.setError("password", "Error");
    });

    act(() => {
      result.current.clearErrors("email");
    });

    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.formState.errors.password).toBe("Error");
  });

  it("clearErrors with no argument removes all errors", () => {
    const { result } = renderHook(() => useForm());

    act(() => {
      result.current.setError("a", "Error A");
      result.current.setError("b", "Error B");
    });

    act(() => {
      result.current.clearErrors();
    });

    expect(Object.keys(result.current.formState.errors)).toHaveLength(0);
    expect(result.current.formState.isValid).toBe(true);
  });

  it("reset restores to defaultValues", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { name: "Alice" } })
    );

    act(() => {
      result.current.setValue("name", "Bob");
      result.current.setError("name", "Error");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.watch("name")).toBe("Alice");
    expect(result.current.formState.errors.name).toBeUndefined();
    expect(result.current.formState.isDirty).toBe(false);
    expect(Object.keys(result.current.formState.dirtyFields)).toHaveLength(0);
    expect(Object.keys(result.current.formState.touchedFields)).toHaveLength(0);
  });

  it("reset accepts new values", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { name: "Alice" } })
    );

    act(() => {
      result.current.reset({ name: "Charlie" });
    });

    expect(result.current.watch("name")).toBe("Charlie");
  });

  it("isSubmitting is true during async submit", async () => {
    let resolveSubmit!: () => void;
    const submitPromise = new Promise<void>((res) => {
      resolveSubmit = res;
    });

    const { result } = renderHook(() =>
      useForm({
        defaultValues: { x: "y" },
        onSubmit: () => submitPromise,
      })
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    // isSubmitting should be true while the promise is pending
    expect(result.current.formState.isSubmitting).toBe(true);

    await act(async () => {
      resolveSubmit();
      await submitPromise;
    });

    expect(result.current.formState.isSubmitting).toBe(false);
  });

  it("handleSubmit prevents default event", async () => {
    const { result } = renderHook(() => useForm());
    const preventDefault = vi.fn();

    await act(async () => {
      result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it("controlled mode via values prop uses external values", () => {
    const { result } = renderHook(() =>
      useForm({ values: { email: "controlled@example.com" } })
    );

    expect(result.current.watch("email")).toBe("controlled@example.com");
  });

  it("touchedFields updated on blur", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { email: "" } })
    );

    const props = result.current.register("email");

    act(() => {
      props.onBlur({
        target: { name: "email" },
      } as unknown as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.formState.touchedFields.email).toBe(true);
  });

  it("dirtyFields updated on change via register onChange", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { email: "" } })
    );

    const props = result.current.register("email");

    act(() => {
      props.onChange({
        target: { name: "email", value: "new@example.com", type: "text" },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formState.dirtyFields.email).toBe(true);
    expect(result.current.watch("email")).toBe("new@example.com");
  });

  it("isValid is true when no errors", () => {
    const { result } = renderHook(() => useForm());
    expect(result.current.formState.isValid).toBe(true);
  });

  it("isDirty is false initially", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { name: "Alice" } })
    );
    expect(result.current.formState.isDirty).toBe(false);
  });

  it("isDirty is true after a value changes from default", () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { name: "Alice" } })
    );

    act(() => {
      result.current.setValue("name", "Bob");
    });

    expect(result.current.formState.isDirty).toBe(true);
  });

  it("async validation resolves errors correctly", async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { username: "" },
        validate: async (vals) => {
          await new Promise((r) => setTimeout(r, 10));
          return vals.username ? ({} as Record<string, string>) : { username: "Required" };
        },
      })
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.formState.errors.username).toBe("Required");
  });

  it("validateOn=blur runs validation when field blurs", async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: "" },
        validate: (vals) =>
          vals.email ? ({} as Record<string, string>) : { email: "Email required" },
        validateOn: "blur",
      })
    );

    const props = result.current.register("email");

    await act(async () => {
      props.onBlur({
        target: { name: "email" },
      } as unknown as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.formState.errors.email).toBe("Email required");
  });

  it("revalidateOn=change re-validates a field with existing error on change", async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { email: "" },
        validate: (vals) =>
          vals.email ? ({} as Record<string, string>) : { email: "Email required" },
        validateOn: "submit",
        revalidateOn: "change",
      })
    );

    // First, trigger submit to get an error
    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.formState.errors.email).toBe("Email required");

    const props = result.current.register("email");

    // Type a valid value — should clear the error
    await act(async () => {
      props.onChange({
        target: { name: "email", value: "good@example.com", type: "text" },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formState.errors.email).toBeUndefined();
  });
});
