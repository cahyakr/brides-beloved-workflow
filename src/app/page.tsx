import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine, ArrowRight, Camera, Check, Mail, MapPin, Phone } from "lucide-react";
import { Brand } from "@/components/brand";
import { LeadForm } from "@/components/lead-form";

const services = [
  ["01", "Full Wedding Planning", "Pendampingan menyeluruh dari konsep pertama sampai hari pernikahan."],
  ["02", "Wedding Organizer", "Eksekusi hari-H yang rapi dengan koordinasi vendor dan rundown detail."],
  ["03", "Intimate Wedding", "Perayaan yang personal, hangat, dan tetap terasa istimewa di setiap detail."],
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fcfbf8] text-[#17304a]">
      <nav className="absolute inset-x-0 top-0 z-20 border-b border-white/20 text-white">
        <div className="mx-auto flex h-[86px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Brand light />
          <div className="hidden items-center gap-8 text-[12px] font-medium md:flex"><a href="#services">Services</a><a href="#journey">How it works</a><a href="#contact">Contact</a></div>
          <div className="flex items-center gap-2"><Link href="/login" className="rounded-full border border-white/35 px-4 py-2.5 text-[11px] font-semibold sm:px-5">Login</Link><a href="#consultation" className="hidden rounded-full bg-white px-5 py-2.5 text-[11px] font-bold text-[#193551] sm:block">Konsultasi</a></div>
        </div>
      </nav>

      <section className="relative min-h-[720px] overflow-hidden bg-[#1b2932] text-white sm:min-h-[780px]">
        <Image src="/wedding-hero.png" alt="Elegant wedding reception by Brides Beloved" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,31,38,.90)_0%,rgba(17,31,38,.64)_43%,rgba(17,31,38,.15)_76%,rgba(17,31,38,.12)_100%)]" />
        <div className="relative mx-auto flex min-h-[720px] max-w-[1240px] items-center px-5 pt-20 sm:min-h-[780px] lg:px-8">
          <div className="max-w-[650px] animate-in">
            <p className="eyebrow mb-6 text-[#e2c79e]">Jakarta · Bali · Destination Wedding</p>
            <h1 className="display-font text-balance text-[55px] font-medium leading-[.96] tracking-[-.04em] sm:text-[76px] lg:text-[88px]">Your story, beautifully planned.</h1>
            <p className="mt-7 max-w-[535px] text-[15px] leading-7 text-white/75 sm:text-base">Kami merancang perjalanan menuju hari pernikahan yang terasa tenang, terarah, dan penuh makna—dengan setiap detail berada di tangan yang tepat.</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href="#consultation" className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d1] px-6 py-3.5 text-[12px] font-bold text-[#213c4e]">Mulai Konsultasi <ArrowRight size={15} /></a><a href="/pricelist.pdf" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3.5 text-[12px] font-semibold"><ArrowDownToLine size={15} /> Download Pricelist</a></div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 hidden w-[45%] border-t border-l border-white/20 bg-white/10 px-10 py-6 backdrop-blur-md lg:block"><p className="text-[11px] uppercase tracking-[.16em] text-white/55">Next celebration</p><div className="mt-2 flex items-end justify-between"><p className="display-font text-2xl">Sarah & Daniel</p><p className="text-xs text-white/65">24 · 12 · 2026</p></div></div>
      </section>

      <section className="border-b border-[#e8e4dc] bg-[#f8f4ed]"><div className="mx-auto grid max-w-[1240px] grid-cols-2 px-5 py-7 sm:grid-cols-4 lg:px-8">{[["120+","Weddings"],["8 th","Experience"],["42","Vendor Partners"],["4.9/5","Client Rating"]].map(([n,l])=><div key={l} className="border-r border-[#ded7cc] px-4 text-center last:border-0"><p className="display-font text-2xl font-semibold sm:text-3xl">{n}</p><p className="mt-1 text-[9px] uppercase tracking-[.15em] text-[#8e8477]">{l}</p></div>)}</div></section>

      <section id="services" className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow text-[#a98150]">Our Services</p><h2 className="display-font mt-5 max-w-md text-5xl leading-[1.04] tracking-[-.03em] sm:text-6xl">Thoughtful planning for an effortless celebration.</h2></div><div className="border-t border-[#dcd8cf]">{services.map(([num,title,desc])=><div key={num} className="grid gap-4 border-b border-[#dcd8cf] py-8 sm:grid-cols-[55px_1fr_1fr]"><span className="text-[11px] font-bold text-[#a88b67]">{num}</span><h3 className="display-font text-2xl font-semibold">{title}</h3><p className="text-sm leading-6 text-[#77828a]">{desc}</p></div>)}</div></div>
      </section>

      <section id="journey" className="bg-[#173044] px-5 py-24 text-white lg:px-8 lg:py-28"><div className="mx-auto max-w-[1180px]"><p className="eyebrow text-[#d6b98f]">The Journey</p><div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="display-font max-w-xl text-5xl leading-none sm:text-6xl">Four steps to your best day.</h2><p className="max-w-sm text-sm leading-6 text-white/55">Satu dashboard menjaga progres tetap transparan untuk Anda dan seluruh tim kami.</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-sm bg-white/15 md:grid-cols-4">{[["01","Consultation"],["02","Planning"],["03","Preparation"],["04","Wedding Day"]].map(([n,l],i)=><div key={n} className="bg-[#173044] p-7"><span className={`grid h-9 w-9 place-items-center rounded-full border text-[10px] ${i<2?"border-[#d4b688] bg-[#d4b688] text-[#173044]":"border-white/25 text-white/60"}`}>{i<2?<Check size={14}/>:n}</span><p className="display-font mt-12 text-2xl">{l}</p><p className="mt-3 text-xs leading-5 text-white/45">{i===0?"Kenali cerita, kebutuhan, dan visi pernikahan Anda.":i===1?"Susun konsep, budget, vendor, dan timeline bersama.":i===2?"Finalisasi detail dengan update progres yang transparan.":"Nikmati hari Anda; biarkan kami menjaga semuanya berjalan."}</p></div>)}</div></div></section>

      <section id="consultation" className="bg-white px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow text-[#a98150]">Begin your journey</p><h2 className="display-font mt-5 text-5xl leading-[1.02] sm:text-6xl">Tell us about your beautiful day.</h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#74808b]">Ceritakan rencana awal Anda. Tim Brides Beloved akan menghubungi melalui WhatsApp untuk menjadwalkan sesi konsultasi.</p><div className="mt-9 space-y-3 text-sm text-[#546778]"><p className="flex items-center gap-3"><Check size={16} className="text-[#a98150]"/>Free initial consultation</p><p className="flex items-center gap-3"><Check size={16} className="text-[#a98150]"/>Personalized package recommendation</p><p className="flex items-center gap-3"><Check size={16} className="text-[#a98150]"/>No commitment required</p></div></div><LeadForm /></div></section>

      <footer id="contact" className="bg-[#0f2638] px-5 py-14 text-white lg:px-8"><div className="mx-auto max-w-[1180px]"><div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 sm:flex-row"><Brand light/><div className="grid gap-3 text-xs text-white/60 sm:grid-cols-2 sm:gap-x-10"><span className="flex items-center gap-2"><Phone size={14}/> +62 812 3456 7890</span><span className="flex items-center gap-2"><Mail size={14}/> hello@bridesbeloved.id</span><a href="https://www.instagram.com/bridesbeloved.id/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><Camera size={14}/> @bridesbeloved.id</a><span className="flex items-center gap-2"><MapPin size={14}/> Jakarta, Indonesia</span></div></div><div className="flex flex-col justify-between gap-4 pt-7 text-[10px] uppercase tracking-[.12em] text-white/35 sm:flex-row"><p>© 2026 Brides Beloved</p><p>Made for beautiful celebrations.</p></div></div></footer>
    </main>
  );
}
