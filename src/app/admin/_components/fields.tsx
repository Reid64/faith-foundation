/**
 * Form field primitives for the FaithProof admin UI.
 *
 * Plain presentational components with no hooks, so they compose inside the
 * client-side <AdminForm> without pulling anything server-only into the bundle.
 * Every control is uncontrolled — <AdminForm> reports errors without navigating,
 * so whatever the user typed survives a failed submit.
 */

import { CONTROL } from "./theme";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[rgba(255,239,179,0.8)]"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[#f87171]" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-[rgba(255,239,179,0.5)]">
            optional
          </span>
        )}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint ? (
        <p className="mt-1.5 text-xs text-[rgba(255,239,179,0.6)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  id,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  step,
  min,
  inputMode,
}: {
  id: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  inputMode?: "decimal" | "numeric" | "text";
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      required={required}
      step={step}
      min={min}
      inputMode={inputMode}
      className={CONTROL}
    />
  );
}

export function Select({
  id,
  name,
  defaultValue,
  options,
  required,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={CONTROL}
    >
      {/* Native option lists are painted by the OS, so each option gets an
          opaque deep-green background — the translucent control colour would
          render as unreadable dark-on-dark in the open dropdown. */}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#013e37]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Textarea({
  id,
  name,
  defaultValue,
  placeholder,
  rows = 4,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      className={`${CONTROL} resize-y`}
    />
  );
}

export function Checkbox({
  id,
  name,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[rgba(255,239,179,0.2)] bg-[rgba(1,62,55,0.6)] accent-[#ffefb3]"
      />
      <label
        htmlFor={id}
        className="cursor-pointer text-sm text-[rgba(255,239,179,0.8)]"
      >
        {label}
        {hint ? (
          <span className="mt-0.5 block text-xs font-normal text-[rgba(255,239,179,0.6)]">
            {hint}
          </span>
        ) : null}
      </label>
    </div>
  );
}
