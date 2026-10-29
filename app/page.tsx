import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import Concerns from "@/components/home/Concerns";
import Bestsellers from "@/components/home/Bestsellers";
import Ingredients from "@/components/home/Ingredients";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <AnnouncementBar />

     

      <main>
        <Hero />

        <Concerns />

        <Bestsellers />

        <Ingredients />

        <Newsletter />
      </main>

    
    </>
  );
}