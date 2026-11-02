const projects = [
  {id:"sarpras",name:"SARPRAS Smart Scan",category:"Aplikasi",status:"Konsep",description:"Konsep layanan digital untuk peminjaman barang dan pengelolaan inventaris sekolah. Katalog ini menampilkan ringkasan awal; detail fitur dan status rilis akan diperbarui setelah audit produk."},
  {id:"aitutor",name:"AI Tutor",category:"Pembelajaran",status:"Konsep",description:"Gagasan pendamping belajar yang membantu manusia berpikir, memahami, dan berkembang. AI berperan sebagai mitra belajar, bukan pengganti proses berpikir."},
  {id:"browser",name:"Browser Projects",category:"Eksperimen",status:"Eksplorasi",description:"Ruang eksperimen untuk menguji pengalaman aplikasi dan proyek berbasis browser. Status dan tautan demo akan ditambahkan setelah build tersedia."},
  {id:"engine",name:"KLIKRA Engine",category:"Aplikasi",status:"Konsep",description:"Fondasi sederhana untuk membangun dan mengembangkan pengalaman digital KLIKRA. Arsitektur dan roadmap masih dalam tahap perumusan."}
];
const grid = document.querySelector("#project-grid");
const search = document.querySelector("#search-input");
const filters = [...document.querySelectorAll(".filter")];
const count = document.querySelector("#result-count");
const empty = document.querySelector("#empty-state");
const dialog = document.querySelector("#project-dialog");
let activeCategory = "Semua";
function renderProjects(){
  const term = search.value.trim().toLowerCase();
  let visible = 0;
  [...grid.querySelectorAll(".project-card")].forEach(card=>{
    const project = projects.find(item=>item.id===card.querySelector("[data-project]").dataset.project);
    const matchCategory = activeCategory==="Semua" || project.category===activeCategory;
    const matchTerm = (project.name+" "+project.category+" "+project.description).toLowerCase().includes(term);
    card.hidden = !(matchCategory && matchTerm);
    if(!card.hidden) visible++;
  });
  count.textContent = visible+" proyek";
  empty.hidden = visible!==0;
}
search.addEventListener("input",renderProjects);
filters.forEach(button=>button.addEventListener("click",()=>{
  activeCategory=button.dataset.filter;
  filters.forEach(item=>item.classList.toggle("active",item===button));
  renderProjects();
}));
grid.addEventListener("click",event=>{
  const button=event.target.closest("[data-project]");
  if(!button)return;
  const project=projects.find(item=>item.id===button.dataset.project);
  if(!project)return;
  document.querySelector("#dialog-category").textContent=project.category.toUpperCase()+" / KLIKRA PROJECT";
  document.querySelector("#dialog-title").textContent=project.name;
  document.querySelector("#dialog-description").textContent=project.description;
  document.querySelector("#dialog-status").textContent="Status katalog: "+project.status;
  dialog.showModal();
});
document.querySelector("#dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
document.querySelector("#year").textContent=new Date().getFullYear();
renderProjects();