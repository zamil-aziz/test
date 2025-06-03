import { AgGridReact } from "ag-grid-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

// Register modules once
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Cell Renderers
const ActionCellRenderer = (props) => {
    const buttonClicked = () => {
        alert(`Action clicked for ${props.data.make} ${props.data.model}`);
    };

    return (
        <div className="flex items-center justify-center h-full gap-2">
            <button
                onClick={buttonClicked}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
                Edit
            </button>
            <button
                onClick={() => alert(`Delete ${props.data.make}`)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
            >
                Delete
            </button>
        </div>
    );
};

const StatusCellRenderer = (props) => {
    const isElectric = props.value;
    return (
        <div className="flex items-center h-full">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
        <div className="flex items-center h-full w-full">
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{width: `${percentage}%`}}
                ></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">{percentage.toFixed(0)}%</span>
        </div>
    );
};

const AgGrid = () => {
    // State Management
    const [rowData, setRowData] = useState([
        { id: 1, make: "Tesla", model: "Model Y", price: 64950, electric: true, year: 2023, category: "SUV", rating: 4.8, inStock: true },
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

    // Column Definitions with all community features
    const columnDefs = useMemo(() => [
        {
            // ROW SELECTION: Checkbox column for multi-select
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50,
            pinned: 'left',
            lockPosition: true,
            suppressMenu: true,
            headerName: "Select"
        },
        {
            field: "make",
            headerName: "Manufacturer",
            // SORTING: Enable sorting
            sortable: true,
            // FILTERING: Enable column filter
            filter: 'agTextColumnFilter',
            // GROUPING: Enable row grouping by this column
            enableRowGroup: true,
            // PINNING: Pin important columns
            pinned: 'left',
            width: 150,
            // CELL STYLING: Custom cell class
            cellClass: 'font-semibold',
            // TOOLTIPS: Show tooltips on hover
            tooltipField: 'make'
        },
        {
            field: "model",
            headerName: "Model",
            sortable: true,
            filter: 'agTextColumnFilter',
            enableRowGroup: true,
            flex: 1,
            // EDITING: Enable cell editing
            editable: true,
            cellEditor: 'agTextCellEditor'
        },
        {
            field: "category",
            headerName: "Category",
            sortable: true,
            // SET FILTER: Dropdown filter for categories
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            width: 120,
            // VALUE GETTER: Computed values
            valueGetter: (params) => params.data.category,
            cellStyle: { fontWeight: 'bold', color: '#2563eb' }
        },
        {
            field: "year",
            headerName: "Year",
            sortable: true,
            // NUMBER FILTER: Numeric filtering
            filter: 'agNumberColumnFilter',
            width: 100,
            cellClass: 'text-center'
        },
        {
            field: "price",
            headerName: "Price (RM)",
            sortable: true,
            filter: 'agNumberColumnFilter',
            // VALUE FORMATTER: Format currency
            valueFormatter: (params) => `RM ${params.value?.toLocaleString() || 0}`,
            cellClass: 'number-cell font-mono',
            headerClass: 'number-header',
            width: 140,
            // AGGREGATION: Enable sum aggregation
            aggFunc: 'sum',
            enableValue: true,
            cellStyle: { textAlign: 'right', fontWeight: '600' }
        },
        {
            field: "price",
            headerName: "Price Progress",
            cellRenderer: ProgressCellRenderer,
            width: 200,
            sortable: false,
            filter: false,
            suppressMenu: true
        },
        {
            field: "rating",
            headerName: "Rating",
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
            cellClass: 'text-center',
            // CELL RENDERER: Custom star rating display
            cellRenderer: (params) => {
                const rating = params.value || 0;
                const stars = '⭐'.repeat(Math.floor(rating));
                return `<span class="text-yellow-500">${stars}</span> ${rating}`;
            }
        },
        {
            field: "electric",
            headerName: "Power Type",
            sortable: true,
            filter: 'agSetColumnFilter',
            enableRowGroup: true,
            width: 130,
            cellRenderer: StatusCellRenderer
        },
        {
            field: "inStock",
            headerName: "In Stock",
            sortable: true,
            filter: 'agSetColumnFilter',
            width: 100,
            cellRenderer: (params) => (
                params.value
                    ? '<span class="text-green-600 font-semibold">✓ Yes</span>'
                    : '<span class="text-red-600 font-semibold">✗ No</span>'
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            cellRenderer: ActionCellRenderer,
            width: 150,
            sortable: false,
            filter: false,
            pinned: 'right',
            suppressMenu: true
        }
    ], []);

    // Grid Options with all community features
    const gridOptions = useMemo(() => ({
        // SELECTION
        rowSelection: 'multiple',
        suppressRowClickSelection: true,

        // PAGINATION
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 25, 50, 100],

        // SORTING
        multiSortKey: 'ctrl',

        // FILTERING
        enableFilter: true,
        floatingFilter: true,

        // COLUMN FEATURES
        enableColResize: true,
        resizeColumnsToFit: true,
        suppressColumnVirtualisation: true,

        // ROW FEATURES
        enableRangeSelection: true,
        enableCellTextSelection: true,

        // GROUPING & AGGREGATION
        autoGroupColumnDef: {
            headerName: "Group",
            field: "make",
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                checkbox: true
            }
        },

        // PERFORMANCE
        animateRows: true,

        // STYLING
        headerHeight: 50,
        rowHeight: 60,

        // STATUS BAR
        statusBar: {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
                { statusPanel: 'agAggregationComponent', align: 'right' }
            ]
        }
    }), []);

    // Event Handlers
    const onSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
        console.log('Selected rows:', selectedData);
    }, []);

    const onGridReady = useCallback((params) => {
        // Auto-size columns to fit
        params.api.sizeColumnsToFit();
    }, []);

    const onCellValueChanged = useCallback((event) => {
        console.log('Cell value changed:', event);
        alert(`${event.colDef.field} changed to: ${event.newValue}`);
    }, []);

    // Utility Functions
    const exportToCSV = () => {
        // Export functionality would need ag-grid-enterprise
        alert('CSV Export - requires Enterprise license');
    };

    const clearFilters = () => {
        if (window.gridApi) {
            window.gridApi.setFilterModel(null);
            setQuickFilterText('');
        }
    };

    const groupByCategory = () => {
        if (window.gridApi) {
            window.gridApi.setColumnVisible('category', false);
            const columnState = window.gridApi.getColumnState();
            const categoryCol = columnState.find(col => col.colId === 'category');
            if (categoryCol) {
                categoryCol.rowGroup = true;
                window.gridApi.applyColumnState({ state: columnState });
            }
        }
    };

    return (
        <div className="w-full h-screen bg-gray-50 p-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🚗 Enhanced AG Grid - All Community Features Demo
                </h1>
                <p className="text-gray-600 mb-4">
                    Comprehensive showcase of AG Grid Community features with detailed explanations
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
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                    >
                        Group by Category
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
                    >
                        Export CSV
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
                        // Additional props for community features
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

            {/* Feature Explanations */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-3 text-blue-600">🔍 Filtering & Search</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong>Quick Filter:</strong> Search across all columns simultaneously</li>
                        <li><strong>Column Filters:</strong> Individual filters per column (text, number, set)</li>
                        <li><strong>Floating Filters:</strong> Filter inputs shown below headers</li>
                        <li><strong>Advanced Filtering:</strong> AND/OR conditions, date ranges</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-3 text-green-600">📊 Sorting & Grouping</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong>Multi-Column Sort:</strong> Hold Ctrl + click headers</li>
                        <li><strong>Row Grouping:</strong> Drag columns to group data</li>
                        <li><strong>Aggregation:</strong> Sum, count, average functions</li>
                        <li><strong>Pivot Mode:</strong> Excel-like pivot table functionality</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-3 text-purple-600">✏️ Editing & Selection</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong>Cell Editing:</strong> Double-click cells to edit</li>
                        <li><strong>Row Selection:</strong> Multi-select with checkboxes</li>
                        <li><strong>Range Selection:</strong> Click and drag to select ranges</li>
                        <li><strong>Copy/Paste:</strong> Standard Ctrl+C/Ctrl+V support</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-3 text-red-600">🎨 Display & Styling</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong>Custom Renderers:</strong> Buttons, progress bars, status badges</li>
                        <li><strong>Column Pinning:</strong> Lock columns to left/right</li>
                        <li><strong>Themes:</strong> Professional styling with themeQuartz</li>
                        <li><strong>Tooltips:</strong> Hover information on cells</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-3 text-orange-600">📄 Pagination & Navigation</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong>Pagination:</strong> Navigate large datasets efficiently</li>
                        <li><strong>Page Size Options:</strong> 10, 25, 50, 100 rows per page</li>
                        <li><strong>Virtual Scrolling:</strong> Handle thousands of rows smoothly</li>
                        <li><strong>Status Bar:</strong> Row counts and selection info</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-3 text-teal-600">⚙️ Column Management</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong>Resizing:</strong> Drag column borders to resize</li>
                        <li><strong>Reordering:</strong> Drag column headers to reorder</li>
                        <li><strong>Show/Hide:</strong> Toggle column visibility</li>
                        <li><strong>Auto-sizing:</strong> Fit columns to content or container</li>
                    </ul>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3 text-blue-800">🚀 Try These Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                        <p><strong>Filtering:</strong> Use the search box or click filter icons in headers</p>
                        <p><strong>Sorting:</strong> Click column headers, hold Ctrl for multi-sort</p>
                        <p><strong>Selection:</strong> Check boxes to select rows, see count update</p>
                        <p><strong>Editing:</strong> Double-click the Model column cells to edit</p>
                    </div>
                    <div>
                        <p><strong>Grouping:</strong> Click "Group by Category" button to see grouping</p>
                        <p><strong>Actions:</strong> Use Edit/Delete buttons in the Actions column</p>
                        <p><strong>Resizing:</strong> Drag column borders to resize columns</p>
                        <p><strong>Pagination:</strong> Navigate pages at the bottom of the grid</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgGrid;
