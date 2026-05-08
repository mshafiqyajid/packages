import { useState } from "react";
import { Form } from "@mshafiqyajid/react-form/styled";
import "@mshafiqyajid/react-form/styles.css";

interface LoginValues {
  email: string;
  password: string;
}

function validateLogin(values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  const email = String(values.email ?? "").trim();
  const password = String(values.password ?? "");

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

export default function FormDemo() {
  const [submitted, setSubmitted] = useState<LoginValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      {submitted ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: 10,
            background: "var(--pp-bg, #f0fdf4)",
            border: "1.5px solid #16a34a",
            color: "#15803d",
            fontWeight: 500,
            fontSize: "0.875rem",
          }}
        >
          Signed in as <strong>{submitted.email}</strong>
          <button
            type="button"
            onClick={() => setSubmitted(null)}
            style={{
              marginLeft: "1rem",
              fontSize: "0.8125rem",
              color: "#15803d",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Reset
          </button>
        </div>
      ) : (
        <Form
          defaultValues={{ email: "", password: "" }}
          validate={validateLogin}
          validateOn="submit"
          revalidateOn="change"
          onSubmit={async (values: Record<string, unknown>) => {
            setSubmitError(null);
            // Simulate an async API call
            await sleep(1200);
            // Simulate an occasional server error for demo purposes
            if ((values.email as string).includes("error")) {
              throw new Error("Server error");
            }
            setSubmitted(values as unknown as LoginValues);
          }}
          onError={() => {
            setSubmitError(null);
          }}
        >
          {(form) => (
            <>
              <Form.Field name="email" label="Email" hint="e.g. user@example.com" required>
                <input
                  type="email"
                  {...form.register("email", { required: true })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "2.5rem",
                    padding: "0 0.75rem",
                    border: `1.5px solid ${form.formState.errors.email ? "var(--rfrm-error-border)" : "var(--rfrm-border, #d4d4d8)"}`,
                    borderRadius: 8,
                    background: "var(--rfrm-bg, #fff)",
                    color: "var(--rfrm-fg, #18181b)",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                />
              </Form.Field>

              <Form.Field name="password" label="Password" hint="At least 8 characters" required>
                <input
                  type="password"
                  {...form.register("password", { required: true })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "2.5rem",
                    padding: "0 0.75rem",
                    border: `1.5px solid ${form.formState.errors.password ? "var(--rfrm-error-border)" : "var(--rfrm-border, #d4d4d8)"}`,
                    borderRadius: 8,
                    background: "var(--rfrm-bg, #fff)",
                    color: "var(--rfrm-fg, #18181b)",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                />
              </Form.Field>

              {submitError && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    color: "var(--rfrm-error-fg, #dc2626)",
                    fontWeight: 500,
                  }}
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <Form.Submit style={{ width: "100%" }}>Sign in</Form.Submit>

              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  color: "var(--rfrm-hint-fg, #71717a)",
                  textAlign: "center",
                }}
              >
                Use <code>error@example.com</code> to simulate a server error.
              </p>
            </>
          )}
        </Form>
      )}
    </div>
  );
}
