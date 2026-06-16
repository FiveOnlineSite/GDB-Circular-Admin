import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PermissionProvider } from "./context/PermissionContext";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/Users";
import UserFormPage from "./pages/Users/UserFormPage";
import RolePermissions from "./pages/RolePermissions";
import Forbidden from "./pages/Forbidden";
import MainLayout from "./components/layout/MainLayout";
import { PublicRoute } from "./components/common/PublicRoute";
import HomeRedirect from "./components/common/HomeRedirect";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PermissionRoute from "./components/common/PermissionRoute";
import SeoList from "./pages/GlobalContent/SEO/SeoList";
import SeoFormPage from "./pages/GlobalContent/SEO/SeoFormPage";
import FooterPage from "./pages/GlobalContent/Footer/FooterPage";
import CertificateList from "./pages/GlobalContent/Certificates/CertificateList";
import CertificateFormPage from "./pages/GlobalContent/Certificates/CertificateFormPage";
import InquiryList from "./pages/GlobalContent/Inquiries/InquiryList";
import FaqList from "./pages/GlobalContent/FAQs/FaqList";
import FaqFormPage from "./pages/GlobalContent/FAQs/FaqFormPage";
import BannerList from "./pages/GlobalContent/Banners/BannerList";
import BannerFormPage from "./pages/GlobalContent/Banners/BannerFormPage";
// Homepage Management
import StatsList from "./pages/Homepage/Stats/StatsList";
import StatsFormPage from "./pages/Homepage/Stats/StatsFormPage";
import ProcessPage from "./pages/Homepage/Process/ProcessPage";
import ProcessStepFormPage from "./pages/Homepage/Process/ProcessStepFormPage";
import WhyChoosePage from "./pages/Homepage/WhyChoose/WhyChoosePage";
import WhyChooseCardFormPage from "./pages/Homepage/WhyChoose/WhyChooseCardFormPage";
// Product Listing
import CatalogueList from "./pages/ProductListing/Catalogue/CatalogueList";
import CatalogueFormPage from "./pages/ProductListing/Catalogue/CatalogueFormPage";
import LogisticsPage from "./pages/ProductListing/Logistics/LogisticsPage";
import LogisticsCardFormPage from "./pages/ProductListing/Logistics/LogisticsCardFormPage";
import CaseStudyList from "./pages/ProductListing/CaseStudy/CaseStudyList";
import CaseStudyFormPage from "./pages/ProductListing/CaseStudy/CaseStudyFormPage";
// About GDB Management
import OverviewPage from "./pages/AboutGDB/Overview/OverviewPage";
import JourneyTimelineList from "./pages/AboutGDB/JourneyTimeline/JourneyTimelineList";
import JourneyTimelineFormPage from "./pages/AboutGDB/JourneyTimeline/JourneyTimelineFormPage";
import WhyIndustryChoosesList from "./pages/AboutGDB/WhyIndustryChooses/WhyIndustryChoosesList";
import WhyIndustryChoosesFormPage from "./pages/AboutGDB/WhyIndustryChooses/WhyIndustryChoosesFormPage";
// Facilities
import FacilitiesList from "./pages/Facilities/FacilitiesList";
import FacilityForm from "./pages/Facilities/FacilityForm";
// GDB Team Management
import TeamMemberList from "./pages/Team/Members/TeamMemberList";
import TeamMemberFormPage from "./pages/Team/Members/TeamMemberFormPage";
import LifeAtGdbList from "./pages/Team/LifeAtGdb/LifeAtGdbList";
import LifeAtGdbFormPage from "./pages/Team/LifeAtGdb/LifeAtGdbFormPage";
// Sellers Page Management
import AlwaysBuyingFormPage from "./pages/Sellers/AlwaysBuying/AlwaysBuyingFormPage";
import FeedstockList from "./pages/Sellers/Feedstock/FeedstockList";
import FeedstockFormPage from "./pages/Sellers/Feedstock/FeedstockFormPage";
import SupplierInquiryList from "./pages/Sellers/Inquiries/SupplierInquiryList";
// News & Updates Management
import CategoryList from "./pages/NewsUpdates/Category/CategoryList";
import NewsList from "./pages/NewsUpdates/News/NewsList";
import NewsFormPage from "./pages/NewsUpdates/News/NewsFormPage";
// Settings Management
import MediaRulesPage from "./pages/Settings/MediaRules/MediaRulesPage";



import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds default
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <PermissionProvider>
          <Router>
            <Toaster position="top-center" richColors expand={false} />
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route path="/" element={<HomeRedirect />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* User Management Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PermissionRoute module="users" action="view">
                        <UserManagement />
                      </PermissionRoute>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/create"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PermissionRoute module="users" action="create">
                        <UserFormPage />
                      </PermissionRoute>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/edit/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PermissionRoute module="users" action="update">
                        <UserFormPage />
                      </PermissionRoute>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Role Permissions Route */}
              <Route
                path="/role-permissions"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PermissionRoute module="roles" action="view">
                        <RolePermissions />
                      </PermissionRoute>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Forbidden route */}
              <Route
                path="/forbidden"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Forbidden />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />


          {/* ===== GLOBAL CONTENT ROUTES ===== */}

          {/* Redirect base /global-content → /global-content/seo */}
          <Route path="/global-content" element={<Navigate to="/global-content/seo" replace />} />

          {/* SEO */}
          <Route path="/global-content/seo" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="view"><SeoList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/seo/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="create"><SeoFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/seo/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="update"><SeoFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Footer */}
          <Route path="/global-content/footer" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="view"><FooterPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Certificates */}
          <Route path="/global-content/certificates" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="view"><CertificateList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/certificates/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="create"><CertificateFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/certificates/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="update"><CertificateFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Inquiries */}
          <Route path="/global-content/inquiries" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="view"><InquiryList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* FAQs */}
          <Route path="/global-content/faqs" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="view"><FaqList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/faqs/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="create"><FaqFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/faqs/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="update"><FaqFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Banners */}
          <Route path="/global-content/banners" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="view"><BannerList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/banners/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="create"><BannerFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/global-content/banners/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="globalContent" action="update"><BannerFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== HOMEPAGE MANAGEMENT ROUTES ===== */}

          {/* Stats */}
          <Route path="/homepage-management" element={<Navigate to="/homepage-management/stats" replace />} />
          <Route path="/homepage-management/stats" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="view"><StatsList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/homepage-management/stats/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="create"><StatsFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/homepage-management/stats/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="update"><StatsFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Process */}
          <Route path="/homepage-management/process" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="view"><ProcessPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/homepage-management/process/steps/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="create"><ProcessStepFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/homepage-management/process/steps/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="update"><ProcessStepFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Why Choose */}
          <Route path="/homepage-management/whychoose" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="view"><WhyChoosePage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/homepage-management/whychoose/cards/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="create"><WhyChooseCardFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/homepage-management/whychoose/cards/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="homepage" action="update"><WhyChooseCardFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== PRODUCT LISTING ROUTES ===== */}

          {/* Catalogue */}
          <Route path="/product-listing" element={<Navigate to="/product-listing/catalogue" replace />} />
          <Route path="/product-listing/catalogue" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="view"><CatalogueList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/catalogue/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="create"><CatalogueFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/catalogue/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="update"><CatalogueFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/catalogue/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="view"><CatalogueFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Logistics Support */}
          <Route path="/product-listing/logistics-support" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="view"><LogisticsPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/logistics-support/cards/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="create"><LogisticsCardFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/logistics-support/cards/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="update"><LogisticsCardFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Case Study */}
          <Route path="/product-listing/case-study" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="view"><CaseStudyList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/case-study/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="create"><CaseStudyFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/case-study/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="update"><CaseStudyFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/product-listing/case-study/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="product" action="view"><CaseStudyFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== ABOUT GDB ROUTES ===== */}

          {/* Facilities */}
          <Route path="/facilities" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="facilities" action="view"><FacilitiesList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/facilities/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="facilities" action="create"><FacilityForm /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/facilities/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="facilities" action="update"><FacilityForm /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/facilities/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="facilities" action="view"><FacilityForm /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Overview */}
          <Route path="/about-gdb" element={<Navigate to="/about-gdb/overview" replace />} />
          <Route path="/about-gdb/overview" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="view"><OverviewPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Journey Timeline */}
          <Route path="/about-gdb/journey-timeline" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="view"><JourneyTimelineList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/about-gdb/journey-timeline/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="create"><JourneyTimelineFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/about-gdb/journey-timeline/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="update"><JourneyTimelineFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Why Industry Chooses */}
          <Route path="/about-gdb/why-industry-chooses-gdb-pcr" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="view"><WhyIndustryChoosesList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/about-gdb/why-industry-chooses-gdb-pcr/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="create"><WhyIndustryChoosesFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/about-gdb/why-industry-chooses-gdb-pcr/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="about" action="update"><WhyIndustryChoosesFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== GDB TEAM MANAGEMENT ROUTES ===== */}

          {/* Redirect /team → /team/members */}
          <Route path="/team" element={<Navigate to="/team/members" replace />} />

          {/* Team Members */}
          <Route path="/team/members" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="members.view"><TeamMemberList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/team/members/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="members.create"><TeamMemberFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/team/members/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="members.update"><TeamMemberFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/team/members/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="members.view"><TeamMemberFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Life at GDB */}
          <Route path="/team/life-at-gdb" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="life.view"><LifeAtGdbList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/team/life-at-gdb/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="life.create"><LifeAtGdbFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/team/life-at-gdb/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="life.update"><LifeAtGdbFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/team/life-at-gdb/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="team" action="life.view"><LifeAtGdbFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== SELLERS PAGE MANAGEMENT ROUTES ===== */}

          {/* Redirect /sellers → /sellers/always-buying */}
          <Route path="/sellers" element={<Navigate to="/sellers/always-buying" replace />} />

          {/* We're Always Buying */}
          <Route path="/sellers/always-buying" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="sellers" action="buying.view"><AlwaysBuyingFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Feedstock Catalogue */}
          <Route path="/sellers/feedstock-catalogue" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="sellers" action="feedstock.view"><FeedstockList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/sellers/feedstock-catalogue/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="sellers" action="feedstock.create"><FeedstockFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/sellers/feedstock-catalogue/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="sellers" action="feedstock.update"><FeedstockFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/sellers/feedstock-catalogue/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="sellers" action="feedstock.view"><FeedstockFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* Supplier Inquiries */}
          <Route path="/sellers/inquiries" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="sellers" action="inquiry.view"><SupplierInquiryList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== NEWS & UPDATES MANAGEMENT ROUTES ===== */}
          <Route path="/news-updates/categories" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="news" action="category.view"><CategoryList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/news-updates" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="news" action="content.view"><NewsList /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/news-updates/create" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="news" action="content.create"><NewsFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/news-updates/edit/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="news" action="content.update"><NewsFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />
          <Route path="/news-updates/view/:id" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="news" action="content.view"><NewsFormPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />

          {/* ===== SETTINGS PAGE MANAGEMENT ROUTES ===== */}
          <Route path="/settings/media-rules" element={
            <ProtectedRoute><MainLayout><PermissionRoute module="settings" action="rules.view"><MediaRulesPage /></PermissionRoute></MainLayout></ProtectedRoute>
          } />



          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
          </Router>
        </PermissionProvider>
      </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
