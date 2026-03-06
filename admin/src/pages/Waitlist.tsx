import type { AdminSession } from "../lib/adminApi";
import WaitlistTable from "../components/WaitlistTable";

type Props = {
  session: AdminSession;
};

export default function Waitlist({ session }: Props) {
  return (
    <div>
      <h1>Waitlist Management</h1>
      <WaitlistTable session={session} />
    </div>
  );
}
