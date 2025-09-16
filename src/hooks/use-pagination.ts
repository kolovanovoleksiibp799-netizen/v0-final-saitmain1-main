import { useCallback, useEffect, useMemo, useState } from "react"

export interface UsePaginationProps {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}

export interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  itemsPerPage: number
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  getPageNumbers: () => number[]
}

export const usePagination = ({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn => {
  const sanitizedItemsPerPage = Math.max(1, Math.floor(itemsPerPage))
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Math.floor(initialPage)))

  const totalPages = useMemo(() => {
    if (sanitizedItemsPerPage <= 0) {
      return 0
    }

    return Math.ceil(totalItems / sanitizedItemsPerPage)
  }, [sanitizedItemsPerPage, totalItems])

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
      return
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    } else if (currentPage < 1) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const hasNextPage = totalPages > 0 && currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  const startIndex = totalPages === 0 ? 0 : (currentPage - 1) * sanitizedItemsPerPage
  const endIndex = totalPages === 0 ? 0 : Math.min(startIndex + sanitizedItemsPerPage, totalItems)

  const goToPage = useCallback(
    (page: number) => {
      if (totalPages === 0) {
        setCurrentPage(1)
        return
      }

      if (!Number.isFinite(page)) {
        return
      }

      const targetPage = Math.floor(page)

      if (targetPage < 1) {
        setCurrentPage(1)
      } else if (targetPage > totalPages) {
        setCurrentPage(totalPages)
      } else {
        setCurrentPage(targetPage)
      }
    },
    [totalPages],
  )

  const goToNextPage = useCallback(() => {
    setCurrentPage((previous) => {
      if (totalPages === 0) {
        return 1
      }

      if (previous >= totalPages) {
        return previous
      }

      return previous + 1
    })
  }, [totalPages])

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((previous) => {
      if (previous <= 1) {
        return 1
      }

      return previous - 1
    })
  }, [])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) {
      return [] as number[]
    }

    const pages: number[] = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page)
    }

    return pages
  }, [currentPage, totalPages])

  const getPageNumbers = useCallback(() => [...pageNumbers], [pageNumbers])

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    itemsPerPage: sanitizedItemsPerPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageNumbers,
  }
}
