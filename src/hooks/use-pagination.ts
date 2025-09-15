import * as React from 'react'

type UsePaginationOptions = {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}

type UsePaginationResult = {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  getPageNumbers: () => number[]
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationResult {
  const [currentPage, setCurrentPage] = React.useState(() =>
    Math.max(1, Math.min(initialPage, Math.max(1, Math.ceil(totalItems / itemsPerPage)))),
  )

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage],
  )

  React.useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages))
  }, [totalPages])

  const goToPage = React.useCallback(
    (page: number) => {
      setCurrentPage(() => {
        if (Number.isNaN(page)) {
          return 1
        }
        return Math.min(Math.max(1, Math.floor(page)), totalPages)
      })
    },
    [totalPages],
  )

  const goToNextPage = React.useCallback(() => {
    setCurrentPage((page) => Math.min(page + 1, totalPages))
  }, [totalPages])

  const goToPreviousPage = React.useCallback(() => {
    setCurrentPage((page) => Math.max(page - 1, 1))
  }, [])

  const getPageNumbers = React.useCallback(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }, [totalPages])

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
  }
}
