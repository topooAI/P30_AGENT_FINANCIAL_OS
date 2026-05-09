type DocsBrandProps = {
  label?: string;
};

export function DocsBrand({ label = "toWebsite" }: DocsBrandProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-flex size-6 items-center justify-center rounded-md bg-zinc-100 text-[13px] font-medium leading-none text-zinc-500"
      >
        t
      </span>
      <span className="text-sm font-medium text-zinc-950">{label}</span>
    </span>
  );
}
