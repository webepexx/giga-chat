import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socket";

export async function GET() {
  // @ts-ignore
  const res = NextResponse.next();
  // @ts-ignore
  const server = res.socket?.server;

  if (server && !server.io) {
    server.io = initSocket(server);
  }

  return new NextResponse("Socket initialized", { status: 200 });
}
