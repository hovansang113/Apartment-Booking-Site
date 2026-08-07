import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/user/Home';
import ListingDetail from './pages/user/ListingDetail';

// TODO: them cac route con lai khi code toi REQ tuong ung
// - /auth/*   (REQ_01, REQ_14)
// - /host/*   (REQ_02, REQ_08, REQ_12, REQ_13)
// - /admin/*  (REQ_03, REQ_04)
// - /bookings/* (REQ_07, REQ_10, REQ_11)

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="bottom-center" />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
