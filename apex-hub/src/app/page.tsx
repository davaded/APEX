import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">APEX Hub</h1>
      <p className="text-slate-400">Infrastructure Setup Verification</p>
      <Button variant="default">Click me (shadcn/ui)</Button>
    </div>
  )
}
