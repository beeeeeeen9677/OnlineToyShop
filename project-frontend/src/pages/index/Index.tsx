import Header from "../../components/Header";

type IndexProps = {
  isLoggedIn: boolean;
};

function Index({ isLoggedIn }: IndexProps) {
  return (
    <div className="animate-fade-in min-h-screen">
      <title>Premium Ben Toys</title>
      <Header isLoggedIn={isLoggedIn} />
    </div>
  );
}

export default Index;
