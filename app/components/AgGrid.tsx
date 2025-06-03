import { AgGridReact } from "ag-grid-react";
import { useState, useEffect } from "react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import GridButton from './GridButton'; // Import your new button component

// Register modules once
ModuleRegistry.registerModules([AllCommunityModule]);

const MyCellComponent = p => {
    return (
        <div className="flex items-center h-full">
            <GridButton
                onClick={() => window.alert(`You clicked on ${p.data.make}`)}
                variant="primary"
                size="xs"
            >
                +
            </GridButton>
            <span>{p.value}</span>
        </div>
    )
}


const AgGrid = () => {
    const [rowData, setRowData] = useState([
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    const [colDefs, setColDefs] = useState([
        {
            field: "make",
            cellRenderer: MyCellComponent,
            flex: 1,
        },
        { field: "model" },
        {
            field: "price",
            valueFormatter: p => `RM ${p.value.toLocaleString()}`,
            cellClass: 'number-cell',
            headerClass: 'number-header',
            flex: 1,
        },
        { field: "electric" },
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
