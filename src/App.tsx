import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import BookList from "@/pages/BookList";
import BookAdd from "@/pages/BookAdd";
import BookDetail from "@/pages/BookDetail";
import TraceView from "@/pages/TraceView";
import MeetupList from "@/pages/MeetupList";
import MeetupCreate from "@/pages/MeetupCreate";
import MeetupDetail from "@/pages/MeetupDetail";
import MeetupCheckIn from "@/pages/MeetupCheckIn";
import ReservationManage from "@/pages/ReservationManage";
import ReaderProfile from "@/pages/ReaderProfile";
import DonationReviewPage from "@/pages/DonationReview";
import ExchangeMarket from "@/pages/ExchangeMarket";
import ExchangeCreate from "@/pages/ExchangeCreate";
import ExchangeDetail from "@/pages/ExchangeDetail";
import ExchangeManage from "@/pages/ExchangeManage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trace/:traceId" element={<TraceView />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/new" element={<BookAdd />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/donations/review" element={<DonationReviewPage />} />
          <Route path="/meetups" element={<MeetupList />} />
          <Route path="/meetups/new" element={<MeetupCreate />} />
          <Route path="/meetups/:id" element={<MeetupDetail />} />
          <Route path="/meetups/:id/checkin" element={<MeetupCheckIn />} />
          <Route path="/reservations" element={<ReservationManage />} />
          <Route path="/readers/:nickname" element={<ReaderProfile />} />
          <Route path="/exchanges" element={<ExchangeMarket />} />
          <Route path="/exchanges/new" element={<ExchangeCreate />} />
          <Route path="/exchanges/:id" element={<ExchangeDetail />} />
          <Route path="/exchanges/manage" element={<ExchangeManage />} />
        </Route>
      </Routes>
    </Router>
  );
}
