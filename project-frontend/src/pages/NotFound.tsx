import Header from "./../components/Header";

function NotFound() {
  return (
    <div className="animate-fade-in min-h-screen ">
      <title>NOT FOUND | PREMIUM BEN TOYS</title>
      <Header />
      <div className="flex justify-center items-center h-100">
        <div className="text-5xl text">404 Not Found</div>
      </div>
    </div>
  );
}

export default NotFound;
