import NavbarMenu from "./comp/navbar";
import HeroContent from "./herocont/page";
import Footer from "./comp/footer/page";

export default function Home() {
  return (
    <div className="w-full min-h-screen">

     <div className="w-full">
        <NavbarMenu />
      </div>
     
      
      <div className="w-full">
        <HeroContent />
      </div>
    

      <div className="w-full">
        <Footer />
      </div>

    </div>
  );
}
