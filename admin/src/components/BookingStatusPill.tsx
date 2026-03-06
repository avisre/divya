type Props = {
  status: string;
};

export default function BookingStatusPill({ status }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: "#fff1d6",
        color: "#8f4b00",
      }}
    >
      {status}
    </span>
  );
}

