import { AgGridReact } from "ag-grid-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

// Register modules once
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Cell Renderers with fixed alignment
const ActionCellRenderer = (props) => {
    const buttonClicked = () => {
        alert(`Action clicked for ${props.data.make} ${props.data.model}`);
    };

    return (
        <div className="flex items-center justify-center h-full w-full gap-2" style={{ height: '100%', minHeight: '60px' }}>
            <button
                onClick={buttonClicked}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors whitespace-nowrap"
            >
                Edit
            </button>
            <button
                onClick={() => alert(`Delete ${props.data.make}`)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors whitespace-nowrap"
            >
                Delete
            </button>
        </div>
    );
};

const StatusCellRenderer = (props) => {
    const isElectric = props.value;
    return (
        <div className="flex items-center justify-center h-full w-full" style={{ height: '100%', minHeight: '60px' }}>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                isElectric
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}>
                {isElectric ? '⚡ Electric' : '⛽ Gas'}
            </span>
        </div>
    );
};

const ProgressCellRenderer = (props) => {
    const percentage = Math.min(100, Math.max(0, (props.value / 100000) * 100));
    return (
        <div className="flex items-center h-full w-full px-2" style={{ height: '100%', minHeight: '60px' }}>
            <div className="w-full bg-gray-200 rounded-full h-2 flex-grow">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{width: `${percentage}%`}}
                ></div>
            </div>
            <span className="ml-2 text-xs text-gray-600 whitespace-nowrap">{percentage.toFixed(0)}%</span>
        </div>
    );
};

const AgGrid = () => {
    // State Management
    const [rowData, setRowData] = useState([
        { id: 1, make: "Tesla", model: "Model Y", price: 64950, electric: true, year: 2023, category: "SUV", rating: 2, inStock: true },
        { id: 2, make: "Ford", model: "F-Series", price: 33850, electric: false, year: 2023, category: "Truck", rating: 4.2, inStock: true },
        { id: 3, make: "Toyota", model: "Corolla", price: 29600, electric: false, year: 2023, category: "Sedan", rating: 4.5, inStock: false },
        { id: 4, make: "BMW", model: "X5", price: 75900, electric: false, year: 2024, category: "SUV", rating: 4.7, inStock: true },
        { id: 5, make: "Audi", model: "e-tron", price: 89500, electric: true, year: 2024, category: "SUV", rating: 4.6, inStock: true },
        { id: 6, make: "Honda", model: "Civic", price: 31900, electric: false, year: 2023, category: "Sedan", rating: 4.3, inStock: true },
        { id: 7, make: "Mercedes", model: "EQS", price: 125000, electric: true, year: 2024, category: "Luxury", rating: 4.9, inStock: false },
        { id: 8, make: "Hyundai", model: "Tucson", price: 38900, electric: false, year: 2023, category: "SUV", rating: 4.1, inStock: true },
    ]);

    const [quickFilterText, setQuickFilterText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    // Column Definitions with proper cell styling
    const columnDefs = useMemo(() => [
        {
            // ROW SELECTION: Checkbox column for multi-select
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width:50,
            pinned: 'left',
            lockPosition: true,
            suppressMenu: true,
            // headerName: "Select",
            // cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
        },
        {
            field: "make",
            headerName: "Manufacturer",
            sortable: true,
            filter: 'agTextColumnFilter',
            pinned: 'left',
            width: 150,
            cellClass: 'font-semibold',
            tooltipField: 'make',
            cellStyle: { display: 'flex', alignItems: 'center' }
        },
        {
            field: "model",
            headerName: "Model",
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
            editable: true,
            cellEditor: 'agTextCellEditor',
            cellStyle: { display: 'flex', alignItems: 'center' }
        },
        {
            field: "category",
            headerName: "Category",
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 120,
            valueGetter: (params) => params.data.category,
            cellStyle: { fontWeight: 'bold', color: '#2563eb', display: 'flex', alignItems: 'center' }
        },
        {
            field: "year",
            headerName: "Year",
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
            cellClass: 'text-center',
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
        },
        {
            field: "price",
            headerName: "Price (RM)",
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => `RM ${params.value?.toLocaleString() || 0}`,
            cellClass: 'number-cell font-mono',
            headerClass: 'number-header',
            width: 140,
            cellStyle: { textAlign: 'right', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }
        },
        {
            field: "price",
            headerName: "Price Progress",
            cellRenderer: ProgressCellRenderer,
            width: 200,
            sortable: false,
            filter: false,
            suppressMenu: true,
            cellStyle: { padding: 0 },
            colId: "priceProgress" // Add unique column ID
        },
        {
            field: "rating",
            headerName: "Rating",
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 120,
            cellRenderer: (params) => {
                const rating = params.value || 0;
                const stars = '⭐'.repeat(Math.floor(rating));
                return (
                    <div className="flex items-center justify-center h-full w-full" style={{ height: '100%', minHeight: '60px' }}>
                        <span className="text-yellow-500 mr-1">{stars}</span>
                        <span className="text-sm font-medium">{rating}</span>
                    </div>
                );
            },
            cellStyle: { padding: 0 }
        },
        {
            field: "electric",
            headerName: "Power Type",
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 130,
            cellRenderer: StatusCellRenderer,
            cellStyle: { padding: 0 } // Remove default padding for custom renderer
        },
        {
            field: "inStock",
            headerName: "In Stock",
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 100,
            cellRenderer: (params) => (
                <div className="flex items-center justify-center h-full w-full" style={{ height: '100%', minHeight: '60px' }}>
                    {params.value ? (
                        <span className="text-green-600 font-semibold">✓ Yes</span>
                    ) : (
                        <span className="text-red-600 font-semibold">✗ No</span>
                    )}
                </div>
            ),
            cellStyle: { padding: 0 }
        },
        {
            field: "actions",
            headerName: "Actions",
            cellRenderer: ActionCellRenderer,
            width: 150,
            sortable: false,
            filter: false,
            pinned: 'right',
            suppressMenu: true,
            cellStyle: { padding: 0 } // Remove default padding for custom renderer
        }
    ], []);

    // Grid Options with proper styling
    const gridOptions = useMemo(() => ({
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 25, 50, 100],
        multiSortKey: 'ctrl',
        enableFilter: true,
        floatingFilter: true,
        enableColResize: true,
        resizeColumnsToFit: true,
        suppressColumnVirtualisation: true,
        enableCellTextSelection: true,
        animateRows: true,
        headerHeight: 50,
        rowHeight: 60,
    }), []);

    // Event Handlers
    const onSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
        console.log('Selected rows:', selectedData);
    }, []);

    const onGridReady = useCallback((params) => {
        params.api.sizeColumnsToFit();
    }, []);

    const onCellValueChanged = useCallback((event) => {
        console.log('Cell value changed:', event);
        alert(`${event.colDef.field} changed to: ${event.newValue}`);
    }, []);

    // Utility Functions
    const exportToCSV = () => {
        alert('CSV Export - requires Enterprise license for advanced export features');
    };

    const clearFilters = () => {
        if (window.gridApi) {
            window.gridApi.setFilterModel(null);
            setQuickFilterText('');
        }
    };

    const groupByCategory = () => {
        alert('Row Grouping - requires Enterprise license (RowGroupingModule)');
    };

    return (
        <div className="w-full h-screen bg-gray-50 p-6">
            {/* Custom CSS to ensure proper alignment */}
            <style jsx>{`
                .ag-cell {
                    display: flex !important;
                    align-items: center !important;
                }

                .ag-cell-wrapper {
                    height: 100% !important;
                    display: flex !important;
                    align-items: center !important;
                }

                .ag-selection-checkbox {
                    align-self: center !important;
                }

                /* Fix for custom renderers */
                .ag-cell[data-colid="priceProgress"],
                .ag-cell[data-colid="electric"],
                .ag-cell[data-colid="actions"],
                .ag-cell[data-colid="rating"],
                .ag-cell[data-colid="inStock"] {
                    padding: 0 !important;
                }

                /* Prevent text overflow */
                .ag-cell {
                    overflow: hidden !important;
                }

                /* Ensure custom renderers take full height */
                .ag-cell .flex {
                    height: 100% !important;
                }
            `}</style>

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🚗 AG Grid Community Features Demo (Alignment Fixed)
                </h1>
                <p className="text-gray-600 mb-4">
                    Fixed vertical alignment issues in custom cell renderers
                </p>

                {/* Control Panel */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Quick Filter:</label>
                        <input
                            type="text"
                            placeholder="Search all columns..."
                            value={quickFilterText}
                            onChange={(e) => setQuickFilterText(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
                    >
                        Clear Filters
                    </button>

                    <button
                        onClick={groupByCategory}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors opacity-50 cursor-not-allowed"
                        disabled
                    >
                        Group by Category (Enterprise)
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors opacity-50 cursor-not-allowed"
                        disabled
                    >
                        Export CSV (Enterprise)
                    </button>

                    <div className="text-sm text-gray-600">
                        Selected: <span className="font-semibold">{selectedRows.length}</span> rows
                    </div>
                </div>
            </div>

            {/* Main Grid Container */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div
                    className="ag-theme-quartz"
                    style={{ height: '600px', width: '100%' }}
                >
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        gridOptions={gridOptions}
                        onGridReady={(params) => {
                            window.gridApi = params.api;
                            onGridReady(params);
                        }}
                        onSelectionChanged={onSelectionChanged}
                        onCellValueChanged={onCellValueChanged}
                        quickFilterText={quickFilterText}
                        theme={themeQuartz}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            flex: 1,
                            minWidth: 100
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgGrid;
