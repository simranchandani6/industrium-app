type ConfigurationAlertProps = {
  missingKeys: string[];
};

export function ConfigurationAlert({ missingKeys }: ConfigurationAlertProps) {
  return (
    <div className="rounded-[28px] border border-signal/20 bg-white/80 p-8 shadow-panel">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal">
        Supabase configuration required
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-ink">
        Add environment variables before using the live platform.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-steel">
        The application code, database schema, seed data, and verification scripts are in place.
        To enable authentication, data loading, storage uploads, and API requests, populate the
        values below in <code>.env.local</code>.
      </p>
      <ul className="mt-6 space-y-2 font-mono text-sm text-ink">
        {missingKeys.map((key) => (
          <li
            key={key}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-3"
          >
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
}

