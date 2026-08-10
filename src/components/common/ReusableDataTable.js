import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '../../lib/utils/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { reorderSequence } from '../../services/reorder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

function descendingComparator(a, b, orderBy) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  // Handle null/undefined values - treat them as lowest priority
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1; // null values go to the end
  if (bValue == null) return -1; // null values go to the end

  // For date strings, convert to Date objects for proper comparison
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);

    // Check if both are valid dates
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      if (bDate < aDate) return -1;
      if (bDate > aDate) return 1;
      return 0;
    }
  }

  // Standard comparison for other types
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function getPageNumbers(currentPage, lastPage) {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);

  if (lastPage <= 1) return range;

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i < lastPage && i > 1) {
      range.push(i);
    }
  }

  range.push(lastPage);

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export default function ReusableDataTable({
  columns,
  rows,
  loading = false,
  checkboxSelection = false,
  pageSize = 10,
  onRowClick,
  handlePageChange,
  handlePerPageChange,
  onRowSelectionModelChange,
  rowSelectionModel,
  title,
  emptyMessage = 'No data available',
  pagination,
  getRowClassName,
  resetSortTrigger,
  handleSortChange,
  sortConfig,
  sequenceReorderScope,
  onSequenceReorderSuccess,
  disableSequenceReorder = false,
}) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [selected, setSelected] = useState(rowSelectionModel || []);
  const [draggedRowId, setDraggedRowId] = useState(null);
  const [orderedRowsOverride, setOrderedRowsOverride] = useState(null);
  const [reordering, setReordering] = useState(false);

  const stableSelectionModel = useMemo(
    () => rowSelectionModel || [],
    [rowSelectionModel],
  );

  // Sync external sort configuration with internal state
  useEffect(() => {
    if (sortConfig) {
      setOrderBy(sortConfig.sortBy || '');
      setOrder(sortConfig.sortOrder?.toLowerCase() || 'asc');
    }
  }, [sortConfig]);

  // Sync external selection with internal state
  useEffect(() => {
    setSelected(stableSelectionModel);
  }, [stableSelectionModel]);

  useEffect(() => {
    setOrderedRowsOverride(null);
  }, [rows]);

  // Reset sort when resetSortTrigger changes
  useEffect(() => {
    if (resetSortTrigger !== undefined) {
      setOrder('asc');
      setOrderBy('');
    }
  }, [resetSortTrigger]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    handleSortChange?.(property, newOrder);
  };

  // Use API pagination data
  const currentPage = pagination?.current_page || 1;
  const perPage = pagination?.per_page || pageSize;
  const hasServerPagination =
    Number.isFinite(pagination?.total) &&
    Number.isFinite(pagination?.last_page) &&
    (pagination.total > 0 || pagination.last_page > 1 || currentPage > 1);

  const totalItems = hasServerPagination ? pagination.total : rows.length;
  const lastPage = hasServerPagination ? pagination.last_page : Math.max(1, Math.ceil(totalItems / perPage));

  // Derived total pages
  const totalPages = lastPage;
  const perPageOptions = useMemo(() => [10, 20, 50, 100], []);
  const selectPerPage = perPageOptions.includes(perPage) ? perPage : pageSize;

  const handleSelectAllClick = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      onRowSelectionModelChange?.(newSelected);
      return;
    }
    setSelected([]);
    onRowSelectionModelChange?.([]);
  };

  const handleRowSelect = (row) => {
    if (!checkboxSelection) return;

    const selectedIndex = selected.indexOf(row.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, row.id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
    onRowSelectionModelChange?.(newSelected);
  };

  const handleChangePage = (newPage) => {
    // API uses 1-based page numbers
    handlePageChange?.(newPage);
  };

  // Since API returns paginated data, just sort the current page's rows if not server-side sorting
  const tableRows = orderedRowsOverride || rows;

  const displayColumns = useMemo(() => {
    const sequenceColumn = columns.find((column) => column.field === 'sequence');
    if (!sequenceColumn) return columns;

    return [
      sequenceColumn,
      ...columns.filter((column) => column.field !== 'sequence'),
    ];
  }, [columns]);

  const sortedRows = useMemo(() => {
    if (handleSortChange) return tableRows;
    return [...tableRows].sort(getComparator(order, orderBy));
  }, [order, orderBy, tableRows, handleSortChange]);

  const getCellValue = (row, column) => {
    if (column.valueGetter) {
      return column.valueGetter(row[column.field], row);
    }
    return row[column.field];
  };

  const isAllSelected = rows.length > 0 && selected.length === rows.length;
  const isSomeSelected = selected.length > 0 && selected.length < rows.length;
  const hasSequenceColumn = displayColumns.some((column) => column.field === 'sequence');
  const isSequenceReorderEnabled =
    Boolean(sequenceReorderScope) &&
    hasSequenceColumn &&
    !disableSequenceReorder;
  const canReorderRows =
    isSequenceReorderEnabled &&
    rows.length > 1;
  const showPagination = rows.length > 0 && !isSequenceReorderEnabled;
  const visibleRows = useMemo(() => {
    if (isSequenceReorderEnabled || hasServerPagination) {
      return sortedRows;
    }

    const startIndex = (currentPage - 1) * perPage;
    return sortedRows.slice(startIndex, startIndex + perPage);
  }, [currentPage, hasServerPagination, isSequenceReorderEnabled, perPage, sortedRows]);
  const displayFrom = visibleRows.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const displayTo = visibleRows.length === 0 ? 0 : displayFrom + visibleRows.length - 1;
  const displaySummary = `Showing ${displayFrom.toLocaleString()} to ${displayTo.toLocaleString()} of ${totalItems.toLocaleString()} entries`;

  const handleSequenceDrop = async (targetRowId) => {
    if (!canReorderRows || draggedRowId == null || draggedRowId === targetRowId) {
      setDraggedRowId(null);
      return;
    }

    const fromIndex = visibleRows.findIndex((row) => row.id === draggedRowId);
    const toIndex = visibleRows.findIndex((row) => row.id === targetRowId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedRowId(null);
      return;
    }

    const reorderedRows = [...visibleRows];
    const [movedRow] = reorderedRows.splice(fromIndex, 1);
    reorderedRows.splice(toIndex, 0, movedRow);

    const pageOffset = hasServerPagination ? (currentPage - 1) * perPage : 0;
    const rowsWithSequence = reorderedRows.map((row, index) => ({
      ...row,
      sequence: pageOffset + index + 1,
    }));
    const sequenceItems = rowsWithSequence.map((row) => ({
      id: row.id,
      sequence: row.sequence,
    }));

    const previousOverride = orderedRowsOverride;
    setOrderedRowsOverride(rowsWithSequence);
    setDraggedRowId(null);
    setReordering(true);

    try {
      await reorderSequence(sequenceReorderScope, sequenceItems);
      toast.success('Sequence updated');
      onSequenceReorderSuccess?.(rowsWithSequence);
    } catch (error) {
      setOrderedRowsOverride(previousOverride);
      toast.error(error.response?.data?.message || 'Failed to update sequence');
    } finally {
      setReordering(false);
    }
  };

  const getColumnStyle = (column) => {
    if (column.field === 'actions') {
      return { width: 'auto' };
    }

    if (column.sticky === 'right') {
      const stickyWidth = column.minWidth || column.width || 180;
      return {
        width: column.width || stickyWidth,
        minWidth: stickyWidth,
      };
    }

    return { width: column.width };
  };

  return (
    <div className='w-full p-3'>
      {/* Header Section */}
      {(title || (checkboxSelection && selected.length > 0)) && (
        <div className='flex items-center justify-between'>
          {checkboxSelection && selected.length > 0 ? (
            <p className='text-sm text-muted-foreground'>
              {selected.length} selected
            </p>
          ) : (
            title && <h2 className='text-lg font-semibold'>{title}</h2>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className='relative border rounded-md overflow-x-auto'>
        {/* Loading Overlay */}
        {loading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        )}
        {reordering && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/55 backdrop-blur-[1px]'>
            <div className='flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm'>
              <Loader2 className='h-4 w-4 animate-spin text-[#981B1F]' />
              Updating sequence...
            </div>
          </div>
        )}

        <div className={cn('transition-opacity', (loading || reordering) && 'opacity-40')}>
          <Table className='min-w-max w-full'>
            <TableHeader>
              <TableRow className='group'>
                {canReorderRows && (
                  <TableHead className='w-12 text-center'>
                    <span className='sr-only'>Drag to reorder</span>
                  </TableHead>
                )}
                {checkboxSelection && (
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                      aria-label='Select all'
                      className={cn(
                        isSomeSelected && 'data-[state=checked]:bg-primary',
                      )}
                    />
                  </TableHead>
                )}
                {displayColumns.map((column) => (
                  <TableHead
                    key={column.headerName}
                    className={cn(
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      column.sticky === 'right' &&
                        'sticky right-0 z-10 bg-white  shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.45)]',
                      'whitespace-nowrap',
                      column.cellClassName,
                      column.headerClassName,
                    )}
                    style={getColumnStyle(column)}
                  >
                    {column.sortable !== false ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='-ml-3 h-8 data-[state=open]:bg-accent'
                        onClick={() => handleRequestSort(column.field)}
                      >
                        <span>{column.headerName}</span>
                        {orderBy === column.field ? (
                          order === 'desc' ? (
                            <ArrowDown className='ml-2 h-4 w-4' />
                          ) : (
                            <ArrowUp className='ml-2 h-4 w-4' />
                          )
                        ) : (
                          <ArrowUpDown className='ml-2 h-4 w-4' />
                        )}
                      </Button>
                    ) : (
                      column.headerName
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length > 0 ? (
                visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      onDragOver={(e) => {
                        if (!canReorderRows || draggedRowId == null) return;
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (!canReorderRows) return;
                        e.preventDefault();
                        handleSequenceDrop(row.id);
                      }}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        onRowClick && 'cursor-pointer',
                        'hover:bg-blue-50 transition',
                        canReorderRows && draggedRowId === row.id && 'opacity-40',
                        getRowClassName?.(row),
                        'group',
                      )}
                    >
                      {canReorderRows && (
                        <TableCell
                          className='w-12 text-center'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type='button'
                            draggable={!reordering}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedRowId(row.id);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', String(row.id));
                            }}
                            onDragEnd={() => setDraggedRowId(null)}
                            className='inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing'
                            title='Drag to change sequence'
                            aria-label='Drag to change sequence'
                          >
                            <GripVertical className='h-4 w-4' />
                          </button>
                        </TableCell>
                      )}
                      {checkboxSelection && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isItemSelected}
                            onChange={() => handleRowSelect(row)}
                          />
                        </TableCell>
                      )}

                      {displayColumns.map((column) => (
                        <TableCell
                          key={column.headerName}
                          onClick={(e) => {
                            // Prevent row navigation when clicking inside actions column
                            if (column.field === 'actions') e.stopPropagation();
                          }}
                          className={cn(
                            column.align === 'right' && 'text-right',
                            column.align === 'center' && 'text-center',
                            column.sticky === 'right' &&
                              'sticky right-0 z-10 bg-white  group-hover:bg-white  shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.45)]',
                            column.field === 'actions' && 'whitespace-nowrap',
                            column.cellClassName,
                          )}
                          style={getColumnStyle(column)}
                        >
                          {column.renderCell
                            ? column.renderCell({
                                row,
                                value: row[column.field],
                                index,
                              })
                            : getCellValue(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      displayColumns.length +
                      (checkboxSelection ? 1 : 0) +
                      (canReorderRows ? 1 : 0)
                    }
                    className='h-24 text-center'
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className='flex items-center justify-between border-t border-gray-100 pb-5 p-2'>
          <div className='flex items-center gap-1.5'>
            <span className='text-sm text-gray-500'>Rows per page:</span>
            <Select
              value={selectPerPage.toString()}
              onValueChange={(value) => {
                const newPerPage = Number(value);
                if (handlePerPageChange) {
                  handlePerPageChange(newPerPage);
                } else {
                  handlePageChange?.(1); // Fallback: Reset to first page
                }
              }}
            >
              <SelectTrigger className='w-[75px] h-9 bg-white border-gray-200 rounded-lg'>
                <SelectValue placeholder={perPage} />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                {perPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-sm text-gray-500 ml-8'>{displaySummary}</span>
          </div>

          <div className='flex items-center gap-1.5'>
            <Button
              variant='outline'
              size='icon'
              className='h-9 w-9 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50'
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <div className='flex items-center gap-1.5'>
              {getPageNumbers(currentPage, totalPages).map((page, index) =>
                page === '...' ? (
                  <span key={`dots-${index}`} className='px-2 text-gray-400'>
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size='sm'
                    className={`h-9 w-9 rounded-lg font-medium ${
                      currentPage === page
                        ? 'bg-[#3a5f9e] hover:bg-[#3a5f9e]/80 text-white border-[#3a5f9e] shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => handleChangePage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant='outline'
              size='icon'
              className='h-9 w-9 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50'
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
