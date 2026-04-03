const ganttStyles = `
.toolbar{
display:flex;
justify-content:flex-end;
align-items:center;
gap:8px;
margin-bottom:12px;
font-family:Arial;
}

.zoom-select{
padding:6px 10px;
border:1px solid #ccc;
border-radius:4px;
background:#fff;
font-size:14px;
}

.container{
display:grid;
grid-template-columns:250px 1fr;
font-family:Arial;
position:relative;
}

.row{
display:grid;
grid-template-columns:250px 1fr;
grid-column:1 / -1;
position:relative;
}

.cell-left{
border-right:1px solid #ccc;
display:flex;
align-items:center;
padding-left:10px;
height:40px;
border-bottom:1px solid #eee;
}

.cell-right{
position:relative;
height:40px;
border-bottom:1px solid #eee;
overflow:hidden;
}

.timeline-header{
grid-column:2;
display:flex;
position:sticky;
top:0;
background:#fff;
z-index:2;
border-bottom:1px solid #ccc;
}

.dependency-layer{
position:absolute;
top:0;
left:250px;
width:calc(100% - 250px);
height:100%;
pointer-events:none;
z-index:3;
overflow:visible;
}

.timeline-day{
min-width:40px;
text-align:center;
border-right:1px solid #eee;
font-size:12px;
padding:4px;
box-sizing:border-box;
}

.timeline-day-holiday{
background:#fff1db;
color:#9a3412;
font-weight:600;
}

.task-bar{
position:absolute;
height:24px;
top:8px;
background:#4CAF50;
border-radius:4px;
cursor:move;
z-index:1;
overflow:hidden;
}

.progress{
height:100%;
background:#2E7D32;
border-radius:4px;
}

.holiday-layer{
position:absolute;
inset:0;
pointer-events:none;
z-index:2;
}

.holiday-marker{
position:absolute;
top:0;
bottom:0;
background:rgba(245,158,11,0.45);
border-left:1px solid rgba(180,83,9,0.45);
border-right:1px solid rgba(180,83,9,0.45);
}

.resize-handle{
position:absolute;
right:0;
width:6px;
height:100%;
background:#333;
cursor:ew-resize;
z-index:3;
}

#modal{
position:fixed;
top:50%;
left:50%;
transform:translate(-50%,-50%);
background:#fff;
padding:20px;
border:1px solid #ccc;
display:none;
z-index:1000;
}

#dateWarning{
color:#c62828;
font-size:13px;
min-height:18px;
margin-bottom:10px;
}
`;
