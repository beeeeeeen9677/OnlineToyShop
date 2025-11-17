import { Link } from "react-router";
import Header from "../../components/Header";

// type IndexProps = {
//   isLoggedIn: boolean;
// };

//function Index({ isLoggedIn }: IndexProps) {
function Index() {
  return (
    <div className="animate-fade-in min-h-screen">
      <title>Premium Ben Toys</title>
      <Header />
      New Arrivals
      {/* New Arriavals */}
      <div className="flex gap-4 p-4 bg-black dark:bg-gray-600">
        {/* Goods */}
        <Link to={""} className="w-40 h-80 bg-white">
          <img src={""} className="bg-amber-200 w-full h-1/2"></img>
          <div className="text-black font-bold text-xl">Title</div>
        </Link>
        <Link to={""} className="w-40 h-80 bg-white">
          <img src={""} className="bg-amber-200 w-full h-1/2"></img>
          <div className="text-black font-bold text-xl">Title</div>
        </Link>
      </div>
      Closing Soon
      {/* Closing Soon */}
      <div className="flex gap-4 p-4 bg-black dark:bg-gray-600">
        {/* Goods */}
        <Link to={""} className="w-40 h-80 bg-white">
          <img src={""} className="bg-amber-200 w-full h-1/2"></img>
          <div className="text-black font-bold text-xl">Title</div>
        </Link>
        <Link to={""} className="w-40 h-80 bg-white">
          <img src={""} className="bg-amber-200 w-full h-1/2"></img>
          <div className="text-black font-bold text-xl">Title</div>
        </Link>
      </div>
    </div>
  );
}

export default Index;
