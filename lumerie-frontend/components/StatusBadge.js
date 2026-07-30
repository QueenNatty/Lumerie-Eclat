const STYLES = {
  pending: "text-ink-muted border-outline-soft",
  confirmed: "text-gold border-gold",
  shipped: "text-gold border-gold",
  delivered: "text-emerald-500 border-emerald-500",
  cancelled: "text-error border-error",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.pending;
  return (
    <span className={`label-caps px-3 py-1 rounded-full border ${style}`}>
      {status}
    </span>
  );
}
