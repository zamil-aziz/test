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
    console.log('ProgressCellRenderer props:', props); // Debug log

    // Get the price value from the data
    const priceValue = props.data?.price || 0;

    // Calculate percentage based on price (max 150,000 for better scaling)
    const percentage = Math.min(100, Math.max(0, (priceValue / 150000) * 100));

    return (
        <div className="flex items-center h-full w-full px-2" style={{ height: '100%', minHeight: '60px' }}>
            <div className="w-full bg-gray-200 rounded-full h-3 flex-grow mr-2">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{width: `${percentage}%`}}
                ></div>
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap min-w-[35px]">
                {percentage.toFixed(0)}%
            </span>
        </div>
    );
};

const AgGrid = () => {
    // State for hydration
    const [mounted, setMounted] = useState(false);

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

    // Handle hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Column Definitions with proper cell styling
    const columnDefs = useMemo(() => [
        {
            // ROW SELECTION: Checkbox column for multi-select
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: 'left',
            lockPosition: true,
            suppressMenu: true,
        },
        {
            field: "make",
            headerName: "Manufacturer",
            sortable: true,
            filter: 'agTextColumnFilter',
            pinned: 'left',
            width: 150,
            cellClass: 'font-semibold ag-cell-center',
            tooltipField: 'make',
        },
        {
            field: "model",
            headerName: "Model",
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
            editable: true,
            cellEditor: 'agTextCellEditor',
            cellClass: 'ag-cell-center'
        },
        {
            field: "category",
            headerName: "Category",
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 120,
            valueGetter: (params) => params.data.category,
            cellClass: 'ag-cell-center category-cell'
        },
        {
            field: "year",
            headerName: "Year",
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
            cellClass: 'text-center ag-cell-center',
        },
        {
            field: "price",
            headerName: "Price (RM)",
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => `RM ${params.value?.toLocaleString() || 0}`,
            cellClass: 'number-cell font-mono ag-cell-right',
            headerClass: 'number-header',
            width: 140,
        },
        {
            // FIXED: Use a different field mapping for the progress bar
            headerName: "Price Progress",
            cellRenderer: ProgressCellRenderer,
            width: 200,
            sortable: false,
            filter: false,
            suppressMenu: true,
            cellClass: 'ag-cell-no-padding',
            colId: "priceProgress", // Unique column ID
            // Don't specify a field, let the renderer access the data directly
            valueGetter: (params) => params.data?.price || 0 // This helps the renderer get the value
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
            cellClass: 'ag-cell-no-padding'
        },
        {
            field: "electric",
            headerName: "Power Type",
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 130,
            cellRenderer: StatusCellRenderer,
            cellClass: 'ag-cell-no-padding'
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
            cellClass: 'ag-cell-no-padding'
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
            cellClass: 'ag-cell-no-padding'
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

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="w-full h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-gray-50 p-6">
            {/* Global CSS styles - moved to external stylesheet or CSS modules recommended */}
            <style dangerouslySetInnerHTML={{
                __html: `
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

                    .ag-cell-center {
                        display: flex !important;
                        align-items: center !important;
                    }

                    .ag-cell-right {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: flex-end !important;
                        text-align: right !important;
                        font-weight: 600 !important;
                    }

                    .ag-cell-no-padding {
                        padding: 0 !important;
                    }

                    .category-cell {
                        font-weight: bold !important;
                        color: #2563eb !important;
                    }

                    .ag-cell {
                        overflow: hidden !important;
                    }

                    .ag-cell .flex {
                        height: 100% !important;
                    }
                `
            }} />

            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🚗 AG Grid Community Features Demo (Hydration Fixed)
                </h1>
                <p className="text-gray-600 mb-4">
                    Fixed SSR hydration mismatch issue and progress bar rendering
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
