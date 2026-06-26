import Header from "../../components/Header";

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
