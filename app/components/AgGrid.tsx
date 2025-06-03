import { AgGridReact } from "ag-grid-react";
import { useState, useEffect } from "react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

// Register modules once
ModuleRegistry.registerModules([AllCommunityModule]);

const AgGrid = () => {
    const [rowData, setRowData] = useState([
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    const [colDefs, setColDefs] = useState([
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "electric" }
    ]);

    return (
        <div style={{ height: 500 }}>
            <AgGridReact 
                rowData={rowData} 
                columnDefs={colDefs}
                theme={themeQuartz}
            />
        </div>
    );
};

export default AgGrid;