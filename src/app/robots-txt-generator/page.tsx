import Footer from "../comp/footer/page";
import Navbar from "../comp/navbar";
import RobotsGenerator from "./robotscont/page";


export default function Home() {
  return (
    <div className="w-full min-h-screen">
      {/* Full-Width Navigation */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* Full-Width Slider */}
      <div className="w-full">
<RobotsGenerator />
      </div>

 <div className="w-full"> 
         <Footer />
       </div>
      
     

    </div>
  );
}
