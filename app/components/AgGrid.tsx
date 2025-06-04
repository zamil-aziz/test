import { AgGridReact } from "ag-grid-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

// Register modules once
ModuleRegistry.registerModules([AllCommunityModule]);

const StatusCellRenderer = (props) => {
    const isElectric = props.value;
    return (
        <div className="flex items-center justify-center h-full">
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
    const priceValue = props.data?.price || 0;
    const percentage = Math.min(100, Math.max(0, (priceValue / 150000) * 100));

    return (
        <div className="flex items-center h-full px-2">
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
    const [mounted, setMounted] = useState(false);
    const [rowData] = useState([
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

    useEffect(() => {
        setMounted(true);
    }, []);

    const columnDefs = useMemo(() => [
        {
            checkboxSelection: true,
            headerCheckboxSelection: true,
            maxWidth: 40,
            minWidth: 30,
            pinned: 'left',
            filter: false,
            resizable: false
            // suppressMenu: true,
        },
        {
            field: "make",
            headerName: "Manufacturer",
            pinned: 'left',
            width: 150,
            cellClass: 'font-semibold',
            tooltipField: 'make',

        },
        {
            field: "model",
            headerName: "Model",
            flex: 1,
            editable: true,
            cellEditor: 'agTextCellEditor',
        },
        {
            field: "category",
            headerName: "Category",
            width: 120,
            cellClass: 'category-cell'
        },
        {
            field: "year",
            headerName: "Year",
            filter: 'agNumberColumnFilter',
            width: 100,
        },
        {
            field: "price",
            headerName: "Price (RM)",
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => `RM ${params.value?.toLocaleString() || 0}`,
            cellClass: 'number-cell font-mono text-right font-semibold',
            width: 140,
        },
        {
            headerName: "Price Progress",
            cellRenderer: ProgressCellRenderer,
            width: 200,
            sortable: false,
            filter: false,
            suppressMenu: true,
            cellClass: 'ag-cell-no-padding',
            colId: "priceProgress",
            valueGetter: (params) => params.data?.price || 0
        },
        {
            field: "rating",
            headerName: "Rating",
            filter: 'agNumberColumnFilter',
            width: 120,
            cellRenderer: (params) => {
                const rating = params.value || 0;
                const stars = '⭐'.repeat(Math.floor(rating));
                return (
                    <div className="flex items-center justify-center h-full">
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
            width: 130,
            cellRenderer: StatusCellRenderer,
            cellClass: 'ag-cell-no-padding'
        },
        {
            field: "inStock",
            headerName: "In Stock",
            width: 100,
            cellRenderer: (params) => (
                <div className="flex items-center justify-center h-full">
                    {params.value ? (
                        <span className="text-green-600 font-semibold">✓ Yes</span>
                    ) : (
                        <span className="text-red-600 font-semibold">✗ No</span>
                    )}
                </div>
            ),
            cellClass: 'ag-cell-no-padding'
        }
    ], []);

    const onSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    }, []);

    const onGridReady = useCallback((params) => {
        params.api.sizeColumnsToFit();
    }, []);

    const onCellValueChanged = useCallback((event) => {
        alert(`${event.colDef.field} changed to: ${event.newValue}`);
    }, []);

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

    if (!mounted) {
        return (
            <div className="w-full h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-gray-50 p-6">
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

                    .ag-cell-no-padding {
                        padding: 0 !important;
                    }

                    .category-cell {
                        font-weight: bold !important;
                        color: #2563eb !important;
                    }

                    .ag-cell .flex {
                        height: 100% !important;
                    }
                `
            }} />

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🚗 AG Grid Community Features Demo
                </h1>
                <p className="text-gray-600 mb-4">
                    Cleaned up version with redundant code removed
                </p>

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

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="ag-theme-quartz" style={{ height: '600px', width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 25, 50, 100]}
                        multiSortKey="ctrl"
                        enableFilter={true}
                        floatingFilter={true}
                        enableColResize={true}
                        suppressColumnVirtualisation={true}
                        enableCellTextSelection={true}
                        animateRows={true}
                        headerHeight={50}
                        rowHeight={64}
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
                            filter: 'agTextColumnFilter',
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
