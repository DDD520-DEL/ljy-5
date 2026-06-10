import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import BookList from "@/pages/BookList";
import BookAdd from "@/pages/BookAdd";
import BookDetail from "@/pages/BookDetail";
import TraceView from "@/pages/TraceView";
import MeetupList from "@/pages/MeetupList";
import MeetupCreate from "@/pages/MeetupCreate";
import MeetupDetail from "@/pages/MeetupDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/trace/:traceId" element={<TraceView />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/new" element={<BookAdd />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/meetups" element={<MeetupList />} />
          <Route path="/meetups/new" element={<MeetupCreate />} />
          <Route path="/meetups/:id" element={<MeetupDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
