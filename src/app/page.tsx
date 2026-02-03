import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {

  const TelegramLink = process.env.TELEGRAM_LINK || ""

  return (
    <div className="relative min-h-dvh w-full overflow-hidden font-sans">
      {/* Background Image */}
      <Image
        src="/bg-image.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center px-6 py-6 md:px-12">
          <div className="flex items-center gap-2">
            <Image
              src="/logo2.png"
              alt="BatCheet logo"
              width={36}
              height={36}
              priority
            />
            <span className="text-xl font-semibold text-white tracking-tight">
              BatCheet
            </span>
          </div>
        </header>

        {/* Hero */}
        <main className="flex flex-1 items-center justify-center px-6 md:px-12">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl text-center font-extrabold md:leading-[70px] tracking-tight text-white md:text-7xl">
              Talk to Strangers, <br className="hidden md:block" />
              Make New Friends !
            </h1>

            <p className="mt-6 max-w-xl text-center text-lg leading-relaxed text-zinc-200">
              Chat with people from around the world, make new friends and share
              moments. A spark to your dating life (18+)
            </p>

            {/* CTA */}
            <div className="mt-5 flex flex-col gap-4 items-center">
              <a
                href="/Batcheet.apk"
                download="Batcheet.apk" // Explicitly name it here
                target="_blank"
                className="
                  rounded-full
                  bg-linear-to-r from-rose-500 via-amber-600 to-rose-500
                  gradient-flow
                  px-8 py-4
                  text-base font-semibold text-white
                  hover:scale-[1.06]
                  transition-transform
                  drop-shadow-xl shadow-[0_8px_30px_rgba(251,113,133,0.45)]
                  cursor-pointer active:scale-[0.95]

                "
              >
                Download App
              </a>

              <a
                href={TelegramLink}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
              >
                Join Telegram
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
