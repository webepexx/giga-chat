"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket/socket-client";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatControls from "@/components/chat/ChatControls";
import { usePlan } from "@/contexts/PlanContext";
import { IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { removeEmojis } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { RandomUserProfile } from "@/hooks/useModChatSocket";

type Message = {
  id: number;
  sender: "mod" | "user";
  type: "text" | "image" | "gift";
  text?: string;
  imageUrl?: string;
  amount?: number;
  currency?: "USD" | "EUR" | "INR";
};


export default function UserChatPage() {
  const { data: session, status } = useSession();

  const socketRef = useRef(getSocket());
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  // const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<RandomUserProfile | null>(null);

  const [myroomId, setRoomId] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [searchingText, setSearchingText] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(1);
  const [chatStatus, setChatStatus] = useState<"idle" | "active" | "partner_skipped" | "me_skipped">('idle')
  const { state, decreaseChat } = usePlan()

  const [userEnded, setUserEnded] = useState(false)

  const username = session?.user.email;
  const noChatsLeft =
    connected &&
    state?.chats_left !== undefined &&
    state.chats_left <= 0;


  useEffect(() => {
    // fetch("/api/socket");
    const socket = socketRef.current;
    console.log("USER SOCKET", socket)
    socket.emit("user:identify", { username });

    socket.on("match:searching", (delay: number) => setSearchingText(`Searching...`));
    socket.on("chat:connected", ({ roomId, userProfile }) => {
      setRoomId(roomId);
      roomIdRef.current = roomId
      setMessages([]);
      setConnected(true);
      // setPartnerName("Random MOD NAME");
      setSearchingText(null);
      // console.log("USER CONNECTED", roomId)
      decreaseChat();
    });


    socket.on("chat:user-profile", ({ roomId, userProfile }) => {
      if (roomId !== roomIdRef.current) return;
      setPartnerProfile(userProfile);
    });


    socket.on("chat:message", (msg) => {
      // console.log("ROOM ID MISSING", msg, myroomId)
      if (msg.roomId !== roomIdRef.current || msg.sender == "user") {
        // console.log("MESSAGE USER recieved",msg)
        return
      }
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id ?? Date.now(),
          sender: "mod",
          type: msg.type,
          text: msg.type === "text" ? msg.text : undefined,
          imageUrl: msg.type === "image" ? msg.text : undefined,
        },
      ]);
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop:typing", () => setIsTyping(false));
    // socket.on("chat:ended", () => { setConnected(false); setPartnerName(null); });
    socket.on("chat:ended", () => {
      setConnected(false);
      // setPartnerName(null);
      setPartnerProfile(null);
      if (!userEnded) setChatStatus("partner_skipped")
      setRoomId(null);
    });

    socket.on('no-mod-available', () => {
      notifications.show({
        title: 'No one is available',
        message: 'Please try again later.',
        icon: <IconX size={18} />,
        color: 'red',
      });

      setSearchingText(null);
    });

    return () => { socket.off(); };
  }, []);

  useEffect(() => {
    if (searchingText === null) { setSeconds(1); return; }
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [searchingText]);

  const handleInputChange = (value: string) => {
    let input = value
    if (!state?.can_send_emojis) {
      const filter = removeEmojis(input)

      if (filter != input) {
        notifications.show({
          title: 'Emojis Not Allowed',
          message: 'Upgrade plan to send emojis',
          icon: <IconX size={18} />,
          color: 'red',
        });
      }
      setInput(filter);
    }
    else {
      setInput(input);
    }
    if (!connected) return;
    socketRef.current.emit("typing");
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socketRef.current.emit("stop:typing"), 800);
  };

  const sendMessage = async () => {
    if (!input.trim() || !connected) return;
    if (noChatsLeft) return;

    socketRef.current.emit("chat:message", {
      roomId: myroomId,
      type: "text",
      content: input,
    });

    // ✅ Optimistically add your own message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        type: "text",
        text: input,
      },
    ]);

    console.log("MESSAGE SENT - USER", myroomId)

    socketRef.current.emit("stop:typing");

    setInput("");
    // await decreaseChat();
  };

  const sendImageMessage = async (imageUrl: string) => {
    if (!imageUrl || !connected) return;
    if (noChatsLeft) return;

    socketRef.current.emit("chat:message", {
      roomId: myroomId,
      type: "image",
      content: imageUrl,
    });

    socketRef.current.emit("stop:typing");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        type: "image",
        imageUrl: imageUrl,
      },
    ]);
  };

  const sendGiftMessage = (
    amount: number,
    currency: "INR",
    giftId?: string
  ) => {

    socketRef.current.emit("chat:message", {
      type: "gift",
      amount,
      currency,
      giftId,
      roomId: myroomId
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        type: "gift",
        amount: amount,
        currency: currency,
      },
    ]);


  };

  const nextChat = () => {
    // 1. Clear UI state immediately so the user knows the transition started
    setChatStatus("me_skipped")
    setMessages([]);
    setConnected(false);
    setPartnerProfile(null);
    setSearchingText('Searching...')

    // 2. Get the delay from plan context (e.g., 90s for Free, 15s for Basic, 0s for Premium)
    const delay = (state?.min_match_time ? state.min_match_time : 0) * 1000;

    setTimeout(() => {
      if (socketRef.current) {
        // socketRef.current.emit("chat:next");
        if (myroomId) {
          socketRef.current.emit("chat:next", myroomId);
        }
        socketRef.current.emit("user:next");
      }
    }, delay);
  };

  const chatStart = () => {
    // 1. Clear UI state immediately so the user knows the transition started
    // setChatStatus("me_skipped")
    setMessages([]);
    setConnected(false);
    setPartnerProfile(null);
    setSearchingText('Searching...')

    // 2. Get the delay from plan context (e.g., 90s for Free, 15s for Basic, 0s for Premium)
    const delay = (state?.min_match_time ? state.min_match_time : 0) * 1000;

    setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("chat:next");
        socketRef.current.emit("user:next");
      }
    }, delay);
  };

  return (
    <div className="h-dvh max-w-125 mx-auto border-x border-white/20 bg-[#0b0f1a] text-white flex ">
      {/* Sidebar */}
      {/* <Sidebar sessions={[]} /> */}

      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          connected={connected}
          partnerProfile={ partnerProfile}
          searchingText={searchingText || undefined}
        />

        <MessageList
          messages={messages}
          isTyping={isTyping}
          partnerProfile={partnerProfile}
          searchingText={searchingText}
          seconds={seconds}
          connected={connected}
          chatStatus={chatStatus}
        />

        <ChatControls
          input={input}
          connected={connected}
          searchingText={searchingText}
          onInputChange={handleInputChange}
          onSendMessage={sendMessage}
          onNext={nextChat}
          onChatStart={chatStart}
          onSendImage={sendImageMessage}
          onSendGift={sendGiftMessage}
          onExit={() => {
            socketRef.current.emit("chat:next", roomIdRef.current);
            setChatStatus("me_skipped")
            setConnected(false);
            setMessages([]);
          }}
          onExit2={() => {
            socketRef.current.emit("chat:next", roomIdRef.current);
            setChatStatus("me_skipped")
            setUserEnded(true)
            setConnected(false);
            setMessages([]);
          }}
        />
      </div>
    </div>

  );
}