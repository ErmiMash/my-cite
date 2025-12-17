// // import React from 'react'
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// // import './App.css'
// //
// // // Компоненты
// // import Layout from './components/Layout.jsx'
// // import Home from './pages/Home.jsx'
// // import Movies from './pages/Movies.jsx'
// // import Series from './pages/Series.jsx'
// //
// // function App() {
// //     return (
// //         <Router>
// //             <Layout>
// //                 <Routes>
// //                     <Route path="/" element={<Home />} />
// //                     <Route path="/movies" element={<Movies />} />
// //                     <Route path="/series" element={<Series />} />
// //                 </Routes>
// //             </Layout>
// //         </Router>
// //     )
// // }
// //
// // export default App
//
// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import './App.css'
//
// // Компоненты
// import Layout from './components/Layout'
// import Home from './pages/Home'
// import Movies from './pages/Movies'
// import Series from './pages/Series'
//
// function App() {
//     return (
//         <Router>
//             <Layout>
//                 <Routes>
//                     <Route path="/" element={<Home />} />
//                     <Route path="/movies" element={<Movies />} />
//                     <Route path="/series" element={<Series />} />
//                 </Routes>
//             </Layout>
//         </Router>
//     )
// }
//
// export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Упрощенные компоненты (убедитесь что файлы существуют)
import Layout from './components/Layout'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Series from './pages/Series'

function App() {
    console.log('🎬 App запущен, Layout подключен')

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/series" element={<Series />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App