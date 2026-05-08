import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ComboboxStyled } from "@mshafiqyajid/react-combobox/styled";
import "@mshafiqyajid/react-combobox/styles.css";
import type { ComboboxOption } from "@mshafiqyajid/react-combobox";

const countries: ComboboxOption[] = [
  { value: "au", label: "Australia",      group: "Oceania" },
  { value: "nz", label: "New Zealand",    group: "Oceania" },
  { value: "br", label: "Brazil",         group: "Americas" },
  { value: "ca", label: "Canada",         group: "Americas" },
  { value: "mx", label: "Mexico",         group: "Americas" },
  { value: "us", label: "United States",  group: "Americas" },
  { value: "cn", label: "China",          group: "Asia" },
  { value: "in", label: "India",          group: "Asia" },
  { value: "jp", label: "Japan",          group: "Asia" },
  { value: "sg", label: "Singapore",      group: "Asia" },
  { value: "de", label: "Germany",        group: "Europe" },
  { value: "fr", label: "France",         group: "Europe" },
  { value: "gb", label: "United Kingdom", group: "Europe" },
  { value: "nl", label: "Netherlands",    group: "Europe" },
  { value: "se", label: "Sweden",         group: "Europe" },
  { value: "ng", label: "Nigeria",        group: "Africa" },
  { value: "za", label: "South Africa",   group: "Africa" },
];

const frameworks: ComboboxOption[] = [
  { value: "react",   label: "React" },
  { value: "vue",     label: "Vue" },
  { value: "svelte",  label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid",   label: "SolidJS" },
  { value: "qwik",    label: "Qwik" },
  { value: "astro",   label: "Astro" },
  { value: "remix",   label: "Remix", disabled: true },
];

const PEOPLE_POOL: ComboboxOption[] = [
  { value: "alice",   label: "Alice Anderson" },
  { value: "bob",     label: "Bob Brown" },
  { value: "carol",   label: "Carol Chen" },
  { value: "dave",    label: "Dave Davis" },
  { value: "eve",     label: "Eve Evans" },
  { value: "frank",   label: "Frank Foster" },
  { value: "grace",   label: "Grace Garcia" },
  { value: "heidi",   label: "Heidi Hayes" },
  { value: "ivan",    label: "Ivan Iglesias" },
  { value: "julia",   label: "Julia Jones" },
];

function mockLoadPeople(query: string): Promise<ComboboxOption[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      resolve(
        q === ""
          ? PEOPLE_POOL
          : PEOPLE_POOL.filter((p) => p.label.toLowerCase().includes(q)),
      );
    }, 500);
  });
}

function ComboboxWrapper({
  size,
  tone,
  clearable,
  disabled,
  creatable,
  async: useAsync,
}: {
  size: string;
  tone: string;
  clearable: boolean;
  disabled: boolean;
  creatable: boolean;
  async: boolean;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [extraOptions, setExtraOptions] = useState<ComboboxOption[]>([]);

  const allOptions = [...frameworks, ...extraOptions];

  const handleCreate = (val: string) => {
    const newOpt: ComboboxOption = { value: val.toLowerCase().replace(/\s+/g, "-"), label: val };
    setExtraOptions((prev) => [...prev, newOpt]);
    setValue(newOpt.value);
  };

  return (
    <div style={{ width: 260 }}>
      {useAsync ? (
        <ComboboxStyled
          value={value}
          onChange={setValue}
          loadOptions={mockLoadPeople}
          placeholder="Type to search people…"
          loadingText="Searching…"
          emptyText="No matches"
          size={size as "sm" | "md" | "lg"}
          tone={tone as "neutral" | "primary" | "success" | "danger"}
          clearable={clearable}
          disabled={disabled}
        />
      ) : (
        <ComboboxStyled
          options={allOptions}
          value={value}
          onChange={setValue}
          placeholder="Search a framework…"
          size={size as "sm" | "md" | "lg"}
          tone={tone as "neutral" | "primary" | "success" | "danger"}
          clearable={clearable}
          disabled={disabled}
          creatable={creatable}
          createLabel={(q: string) => `Add "${q}"`}
          onCreateOption={handleCreate}
        />
      )}
    </div>
  );
}

function CountryDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div>
      <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
        Grouped options (countries by region)
      </p>
      <ComboboxStyled
        options={countries}
        value={value}
        onChange={setValue}
        placeholder="Search a country…"
        clearable
        style={{ width: 280 }}
      />
    </div>
  );
}

function AsyncDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div>
      <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
        Async loadOptions (mock 500ms delay)
      </p>
      <ComboboxStyled
        value={value}
        onChange={setValue}
        loadOptions={mockLoadPeople}
        placeholder="Type to search people…"
        loadingText="Searching…"
        emptyText="No matches"
        clearable
        style={{ width: 280 }}
      />
    </div>
  );
}

function CreatableDemo() {
  const [value, setValue] = useState<string | null>(null);
  const [extra, setExtra] = useState<ComboboxOption[]>([]);

  const handleCreate = (val: string) => {
    const opt: ComboboxOption = { value: val.toLowerCase().replace(/\s+/g, "-"), label: val };
    setExtra((prev) => [...prev, opt]);
    setValue(opt.value);
  };

  return (
    <div>
      <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
        Creatable — type a new option and press Enter
      </p>
      <ComboboxStyled
        options={[...frameworks, ...extra]}
        value={value}
        onChange={setValue}
        placeholder="Search or create…"
        creatable
        createLabel={(q: string) => `Add "${q}"`}
        onCreateOption={handleCreate}
        clearable
        style={{ width: 280 }}
      />
    </div>
  );
}

function FormDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ComboboxStyled
        options={frameworks}
        value={value}
        onChange={setValue}
        label="Framework"
        hint="Choose your primary framework"
        placeholder="Select…"
        clearable
        style={{ width: 280 }}
      />
      <ComboboxStyled
        options={frameworks}
        value={null}
        onChange={() => {}}
        label="Required field"
        required
        invalid
        error="This field is required"
        placeholder="Select…"
        style={{ width: 280 }}
      />
    </div>
  );
}

export default function ComboboxDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <PropPlayground
        componentName="ComboboxStyled"
        importLine={`import { ComboboxStyled } from "@mshafiqyajid/react-combobox/styled";\nimport "@mshafiqyajid/react-combobox/styles.css";`}
        props={[
          { name: "size",      control: { type: "segmented", options: ["sm", "md", "lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
          { name: "tone",      control: { type: "segmented", options: ["neutral", "primary", "success", "danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
          { name: "clearable", control: { type: "toggle" },                                                                  defaultValue: true,      omitWhen: true },
          { name: "disabled",  control: { type: "toggle" },                                                                  defaultValue: false,     omitWhen: false },
          { name: "creatable", control: { type: "toggle" },                                                                  defaultValue: false,     omitWhen: false },
          { name: "async",     label: "loadOptions (mock)", control: { type: "toggle" },                                     defaultValue: false,     omitWhen: false },
        ]}
        staticProps={{ options: "{options}", value: "{value}", onChange: "{setValue}" }}
        render={(v) => (
          <ComboboxWrapper
            key={String(v.async)}
            size={v.size as string}
            tone={v.tone as string}
            clearable={v.clearable as boolean}
            disabled={v.disabled as boolean}
            creatable={v.creatable as boolean}
            async={v.async as boolean}
          />
        )}
      />

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Grouped options</h3>
        <CountryDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Async loadOptions</h3>
        <AsyncDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Creatable</h3>
        <CreatableDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Form integration (label / hint / error)</h3>
        <FormDemo />
      </section>
    </div>
  );
}
