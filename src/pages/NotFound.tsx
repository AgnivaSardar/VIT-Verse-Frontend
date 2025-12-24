import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

function NotFound() {
  return (
    <div className="app-layout">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          <div className="container">
            <h1 className="page-title">404 - Page Not Found</h1>
            <p className="page-subtitle">The page you are looking for does not exist.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default NotFound;
