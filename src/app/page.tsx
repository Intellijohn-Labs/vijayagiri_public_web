import { Booking } from "@/components/booking";
import { BookingProvider } from "@/components/booking-context";
import { Footer } from "@/components/footer";
import { GearHud } from "@/components/gear-hud";
import { GearProvider } from "@/components/gear-context";
import { GearSection } from "@/components/gear-section";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Range } from "@/components/range";
import { RoutesSection } from "@/components/routes-section";
import { Showcase } from "@/components/showcase";
import { Showrooms } from "@/components/showrooms";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ToastProvider } from "@/components/toast";
import { WhatsAppWidget } from "@/components/whatsapp-widget";

export default function Home() {
  return (
    <SmoothScroll>
      <GearProvider>
        <ToastProvider>
          <BookingProvider>
            <a href="#showcase" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">
              Skip to models
            </a>
            <Header />
            <main>
              <Hero />
              <Showcase />
              <Range />
              <RoutesSection />
              <GearSection />
              <Booking />
              <Showrooms />
            </main>
            <Footer />
            <GearHud />
            <WhatsAppWidget />
          </BookingProvider>
        </ToastProvider>
      </GearProvider>
    </SmoothScroll>
  );
}
